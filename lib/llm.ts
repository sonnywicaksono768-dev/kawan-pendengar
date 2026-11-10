import { canGenerate, config, hasDirectProvider, hasRouter } from "@/lib/config";
import type { ChatMessage } from "@/lib/validate";
import type { RiskLevel } from "@/lib/crisis";

type ProviderName = "gemini" | "groq" | "openrouter";

export type ModelRequest = {
  messages: ChatMessage[];
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
};

export class LlmUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LlmUnavailableError";
  }
}

function timeoutSignal(): AbortSignal {
  return AbortSignal.timeout(config.timeoutMs);
}

function assertText(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new LlmUnavailableError("empty completion");
  }
  return value.trim();
}

/** Layer 3: 9Router, OpenAI compatible, 20 second timeout by default. */
async function callRouter(request: ModelRequest): Promise<string> {
  if (!hasRouter) throw new LlmUnavailableError("router not configured");

  const response = await fetch(`${config.nineRouterUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.nineRouterKey}`,
    },
    body: JSON.stringify({
      model: request.model || config.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      top_p: request.topP,
      stream: false,
    }),
    signal: timeoutSignal(),
  });

  if (!response.ok) throw new LlmUnavailableError(`router ${response.status}`);
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return assertText(data.choices?.[0]?.message?.content);
}

/** Direct Gemini call, used only on the fallback path. */
async function callGemini(request: ModelRequest): Promise<string> {
  if (!config.geminiKey) throw new LlmUnavailableError("gemini not configured");

  const system = request.messages
    .filter((message) => message.role === "assistant" && message.content === request.messages[0].content)
    .map((message) => message.content)
    .join("\n");
  const conversation = request.messages.slice(1).map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: conversation,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens,
        topP: request.topP,
      },
    }),
    signal: timeoutSignal(),
  });

  if (!response.ok) throw new LlmUnavailableError(`gemini ${response.status}`);
  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return assertText(data.candidates?.[0]?.content?.parts?.[0]?.text);
}

/** OpenAI-compatible providers: Groq and OpenRouter. */
async function callOpenAiCompatible(
  request: ModelRequest,
  provider: "groq" | "openrouter",
): Promise<string> {
  const key = provider === "groq" ? config.groqKey : config.openRouterKey;
  if (!key) throw new LlmUnavailableError(`${provider} not configured`);

  const base =
    provider === "groq" ? "https://api.groq.com/openai/v1" : "https://openrouter.ai/api/v1";
  const model = provider === "groq" ? config.groqModel : config.openRouterModel;

  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      ...(provider === "openrouter" ? { "X-Title": "Kawan Pendengar" } : {}),
    },
    body: JSON.stringify({
      model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      top_p: request.topP,
      stream: false,
    }),
    signal: timeoutSignal(),
  });

  if (!response.ok) throw new LlmUnavailableError(`${provider} ${response.status}`);
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return assertText(data.choices?.[0]?.message?.content);
}

async function callProvider(provider: ProviderName, request: ModelRequest): Promise<string> {
  if (provider === "gemini") return callGemini(request);
  if (provider === "groq") return callOpenAiCompatible(request, "groq");
  return callOpenAiCompatible(request, "openrouter");
}

/**
 * Blueprint 5.2 and 9.6: try 9Router first, then each direct provider in the
 * order named by FALLBACK_PROVIDERS. Any 429 or 5xx moves to the next provider.
 */
async function callDirectProviders(request: ModelRequest): Promise<string> {
  const configured: ProviderName[] = config.fallbackProviders.filter(
    (provider): provider is ProviderName =>
      provider === "gemini" || provider === "groq" || provider === "openrouter",
  );

  for (const provider of configured) {
    try {
      return await callProvider(provider, request);
    } catch (error) {
      if (config.demoMode) {
        console.warn(`[llm] ${provider} gagal, lanjut ke provider berikutnya`);
      }
      void error;
    }
  }

  throw new LlmUnavailableError("all providers failed");
}

/**
 * Local development only. It never runs in production, and it exists so the
 * whole pipeline can be exercised without spending a real quota.
 */
function demoReply(request: ModelRequest): string {
  const lastUser = [...request.messages].reverse().find((message) => message.role === "user");
  const text = (lastUser?.content ?? "").toLowerCase();

  if (/ringkasan sesi ini/.test(text)) {
    return "Ringkasan sesi: kamu datang dengan rasa lelah yang sudah menumpuk. Kamu menyebut pekerjaan sebagai beban utama, dan kamu masih ingin memahami bagian mana yang paling menguras. Satu langkah kecil yang bisa dicoba: memilih satu tugas yang paling mendesak, lalu memberi jeda pendek setelahnya.";
  }

  if (/obat|dosis|resep/.test(text)) {
    return "Aku tidak bisa menyarankan obat atau dosis, karena itu ranah dokter dan psikiater. Yang bisa aku temani, kita lihat dulu apa yang paling mengganggu harimu belakangan ini.";
  }
  if (/depresi|bipolar|gangguan|diagnos/.test(text)) {
    return "Aku tidak bisa memastikan diagnosis, karena itu hanya bisa dilakukan psikolog atau psikiater. Yang bisa kita lakukan sekarang, memahami apa yang kamu rasakan tanpa memberi label. Bagian mana yang paling berat akhir-akhir ini?";
  }
  return "Aku mendengar kok. Kedengarannya hal itu memang menguras, dan wajar kalau kamu merasa lelah. Kalau boleh tahu, bagian mana yang paling terasa berat hari ini?";
}

export async function generate(request: ModelRequest): Promise<string> {
  if (!canGenerate()) {
    throw new LlmUnavailableError("no provider configured");
  }

  if (config.demoMode) return demoReply(request);

  try {
    return await callRouter(request);
  } catch {
    if (!hasDirectProvider()) throw new LlmUnavailableError("router failed, no fallback");
    return callDirectProviders(request);
  }
}

/**
 * Layer 2 crisis classifier. Anything other than a clean parse falls back to
 * SAFE and lets layers 1 and 3 carry the caution (blueprint 9.3).
 */
export async function classifyRisk(recentUserMessages: string[]): Promise<RiskLevel> {
  const text = recentUserMessages.slice(-5).join("\n");

  try {
    const answer = await generate({
      messages: [
        {
          role: "assistant",
          content:
            "Klasifikasikan risiko pada pesan pengguna. Jawab hanya dengan satu kata: SAFE, RISK, atau CRISIS. SAFE berarti tidak ada sinyal menyakiti diri. RISK berarti ada sinyal tersirat seperti keinginan menghilang atau capek hidup. CRISIS berarti ada niat atau metode menyakiti diri yang jelas.",
        },
        { role: "user", content: text },
      ],
      model: config.classifierModel || config.model,
      temperature: 0,
      maxTokens: 5,
      topP: 0.9,
    });

    const cleaned = answer.toUpperCase();
    if (cleaned.includes("CRISIS")) return "CRISIS";
    if (cleaned.includes("RISK")) return "RISK";
    return "SAFE";
  } catch {
    return "SAFE";
  }
}

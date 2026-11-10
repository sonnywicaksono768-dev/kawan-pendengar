import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { canGenerate } from "@/lib/config";
import { checkRateLimit } from "@/lib/ratelimit";
import { validateChatPayload } from "@/lib/validate";
import { crisisResponse, hotlineListForResponse, keywordRisk, type RiskAssessment } from "@/lib/crisis";
import { classifyRisk, generate } from "@/lib/llm";
import { selectKnowledge } from "@/lib/knowledge";
import {
  buildModelMessages,
  generationParams,
  PROMPT_VERSION,
  REGENERATION_INSTRUCTION,
  SAFE_FALLBACK_REPLY,
} from "@/lib/prompt";
import { checkOutput, recordViolations } from "@/lib/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Vercel Hobby defaults to 10s; the tunnel + free-model round trip (and a possible
// regeneration) needs more headroom. 60s is the Hobby ceiling.
export const maxDuration = 60;

const MESSAGES = {
  invalid: "Pesanmu belum bisa kuproses, coba tulis ulang ya.",
  rateLimit: "Banyak yang sedang bercerita saat ini, coba lagi sebentar ya.",
  unavailable: "Maaf, aku butuh waktu sejenak untuk berpikir. Bisa ulangi pesannya?",
} as const;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function json(body: unknown, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function crisisBody(message: string) {
  return {
    type: "crisis" as const,
    message,
    crisisMode: true,
    hotlines: hotlineListForResponse(),
    promptVersion: PROMPT_VERSION,
  };
}

/** Layer 2 runs only when layer 1 is clean but the message stays emotional. */
const AMBIGUOUS_EMOTION = /(nyerah|hampa|kosong|tidak ada gunanya|capek|lelah|sendiri|berat|putus asa|overthinking)/;

export async function POST(request: NextRequest) {
  const limit = await checkRateLimit(clientIp(request));
  if (!limit.allowed) {
    return json(
      { type: "error", message: MESSAGES.rateLimit, retryable: true },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ type: "error", message: MESSAGES.invalid, retryable: false }, 400);
  }

  const parsed = validateChatPayload(body);
  if (!parsed.ok) {
    return json({ type: "error", message: MESSAGES.invalid, retryable: false }, 400);
  }

  const { mode, messages } = parsed.data;
  const userMessages = messages.filter((message) => message.role === "user").map((message) => message.content);
  const latest = userMessages[userMessages.length - 1] ?? "";

  // Grounding is static on purpose and never spends an AI call (blueprint 14).
  if (mode === "grounding") {
    return json({
      type: "reply",
      message:
        "Latihan menenangkan diri ada di layar. Ikuti satu langkah setiap kali, tanpa perlu terburu-buru. Aku menunggu di sini.",
      crisisMode: false,
    });
  }

  // Layer 1: keyword and regex over the last five user messages.
  let assessment: RiskAssessment = keywordRisk(userMessages);

  // Layer 2: a short classifier for the ambiguous middle, never for a message
  // that already reads as SAFE without emotional weight.
  if (assessment.level === "SAFE" && AMBIGUOUS_EMOTION.test(latest.toLowerCase())) {
    const classified = await classifyRisk(userMessages);
    if (classified === "CRISIS") assessment = { level: "CRISIS", kind: "self" };
    if (classified === "RISK") assessment = { level: "RISK", kind: "self" };
  }

  // Layer 3 lives in the system prompt, which stays in every request.

  if (assessment.level !== "SAFE") {
    // Crisis bypasses the normal AI call entirely (blueprint 9.3).
    return json(crisisBody(crisisResponse(assessment.kind)));
  }

  if (!canGenerate()) {
    return json({ type: "error", message: MESSAGES.unavailable, retryable: true }, 503);
  }

  const references = selectKnowledge(latest);
  const modelMessages = buildModelMessages({ mode, messages, references });

  try {
    let reply = await generate({
      messages: modelMessages,
      model: "",
      ...generationParams,
    });

    let guard = checkOutput(reply);

    if (!guard.ok) {
      recordViolations(guard.violations);
      reply = await generate({
        messages: [
          ...modelMessages,
          { role: "assistant", content: reply },
          { role: "user", content: REGENERATION_INSTRUCTION },
        ],
        model: "",
        ...generationParams,
      });
      guard = checkOutput(reply);

      if (!guard.ok) {
        recordViolations(guard.violations);
        reply = SAFE_FALLBACK_REPLY;
      }
    }

    return json({ type: "reply", message: reply, crisisMode: false });
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[api/chat] semua jalur LLM gagal");
    }
    return json({ type: "error", message: MESSAGES.unavailable, retryable: true }, 503);
  }
}

export async function GET() {
  return json({ type: "error", message: MESSAGES.invalid, retryable: false }, 405);
}


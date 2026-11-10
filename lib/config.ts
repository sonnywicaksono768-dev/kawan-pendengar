/**
 * Server-side configuration. Every secret comes from the environment, never
 * from the repository (blueprint sections 19 and 25).
 */

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clean(value: string | undefined): string {
  return (value ?? "").trim();
}

export const config = {
  nineRouterUrl: clean(process.env.NINEROUTER_URL).replace(/\/+$/, ""),
  nineRouterKey: clean(process.env.NINEROUTER_API_KEY),
  model: clean(process.env.LLM_MODEL),
  classifierModel: clean(process.env.LLM_CLASSIFIER_MODEL),
  timeoutMs: toInt(process.env.LLM_TIMEOUT_MS, 20000),
  fallbackProviders: clean(process.env.FALLBACK_PROVIDERS)
    .split(",")
    .map((provider) => provider.trim().toLowerCase())
    .filter(Boolean),
  geminiKey: clean(process.env.GEMINI_API_KEY),
  groqKey: clean(process.env.GROQ_API_KEY),
  openRouterKey: clean(process.env.OPENROUTER_API_KEY),
  geminiModel: clean(process.env.GEMINI_MODEL) || "gemini-2.0-flash",
  groqModel: clean(process.env.GROQ_MODEL) || "llama-3.3-70b-versatile",
  openRouterModel:
    clean(process.env.OPENROUTER_MODEL) || "meta-llama/llama-3.3-70b-instruct:free",
  rateLimitPerMinute: toInt(process.env.RATE_LIMIT_PER_MINUTE, 20),
  rateLimitPerDay: toInt(process.env.RATE_LIMIT_PER_DAY, 200),
  upstashUrl: clean(process.env.UPSTASH_REDIS_REST_URL).replace(/\/+$/, ""),
  upstashToken: clean(process.env.UPSTASH_REDIS_REST_TOKEN),
  ipSalt: clean(process.env.IP_HASH_SALT),
  streamingEnabled: clean(process.env.STREAMING_ENABLED) === "true",
  demoMode:
    process.env.NODE_ENV !== "production" && clean(process.env.LLM_DEMO) === "1",
};

export const hasRouter = Boolean(config.nineRouterUrl && config.nineRouterKey);

export function hasDirectProvider(): boolean {
  return Boolean(config.geminiKey || config.groqKey || config.openRouterKey);
}

export function canGenerate(): boolean {
  return config.demoMode || hasRouter || hasDirectProvider();
}

export const GENERATION_DEFAULTS = {
  temperature: 0.5,
  maxTokens: 300,
  topP: 0.9,
} as const;

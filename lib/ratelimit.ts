import { createHash } from "node:crypto";
import { config } from "@/lib/config";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type Bucket = {
  count: number;
  expiresAt: number;
};

const memory = new Map<string, Bucket>();

function hashIp(ip: string): string {
  const salt = config.ipSalt || "kawan-pendengar-development-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

function memoryIncrement(key: string, windowSeconds: number): { count: number; expiresAt: number } {
  const now = Date.now();
  const existing = memory.get(key);
  if (!existing || existing.expiresAt <= now) {
    const bucket = { count: 1, expiresAt: now + windowSeconds * 1000 };
    memory.set(key, bucket);
    return bucket;
  }
  existing.count += 1;
  return existing;
}

async function upstash(command: string[]): Promise<unknown> {
  const response = await fetch(`${config.upstashUrl}/${command.map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${config.upstashToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`upstash ${response.status}`);
  const data = (await response.json()) as { result?: unknown };
  return data.result;
}

async function increment(key: string, windowSeconds: number): Promise<{ count: number; expiresAt: number }> {
  if (config.upstashUrl && config.upstashToken) {
    try {
      const count = Number(await upstash(["incr", key]));
      if (count === 1) await upstash(["expire", key, String(windowSeconds)]);
      return { count, expiresAt: Date.now() + windowSeconds * 1000 };
    } catch {
      // Fall through to the in-memory bucket. Less reliable on serverless, still
      // better than no limit at all (blueprint 9.2).
    }
  }
  return memoryIncrement(key, windowSeconds);
}

/**
 * Rate limit per hashed IP. The raw IP is never stored, only a salted hash.
 * Both the minute and the day window must allow the request.
 */
export async function checkRateLimit(ip: string, now = Date.now()): Promise<RateLimitResult> {
  const prefix = `kp:rl:${hashIp(ip)}`;
  const minuteKey = `${prefix}:m:${Math.floor(now / 60000)}`;
  const dayKey = `${prefix}:d:${Math.floor(now / 86400000)}`;

  const [minute, day] = await Promise.all([
    increment(minuteKey, 60),
    increment(dayKey, 86400),
  ]);

  if (minute.count > config.rateLimitPerMinute) {
    return { allowed: false, remaining: 0, retryAfterSeconds: 45 };
  }
  if (day.count > config.rateLimitPerDay) {
    return { allowed: false, remaining: 0, retryAfterSeconds: 3600 };
  }

  return {
    allowed: true,
    remaining: Math.max(0, config.rateLimitPerMinute - minute.count),
    retryAfterSeconds: 0,
  };
}

export function resetRateLimitMemory(): void {
  memory.clear();
}

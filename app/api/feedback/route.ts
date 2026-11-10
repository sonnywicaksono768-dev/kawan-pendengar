import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";
import { CHAT_MODES } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Labels only. No conversation content is accepted or stored (blueprint 12.2). */
const counts = new Map<string, number>();

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

export async function POST(request: NextRequest) {
  const limit = await checkRateLimit(clientIp(request));
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: "Coba lagi sebentar ya." },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const rating = payload.rating;
  const mode = payload.mode;

  if (rating !== "helpful" && rating !== "not_helpful") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof mode !== "string" || !(CHAT_MODES as readonly string[]).includes(mode)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const key = `${mode}:${rating}`;
  counts.set(key, (counts.get(key) ?? 0) + 1);

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  return NextResponse.json(
    { ok: true, aggregate: Object.fromEntries(counts) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

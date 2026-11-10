import { NextResponse } from "next/server";
import { canGenerate, config, hasDirectProvider, hasRouter } from "@/lib/config";
import { PROMPT_VERSION } from "@/lib/prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const provider = config.demoMode
    ? "demo"
    : hasRouter
      ? "router"
      : hasDirectProvider()
        ? "direct"
        : "unconfigured";

  return NextResponse.json(
    {
      status: "ok",
      promptVersion: PROMPT_VERSION,
      provider,
      canGenerate: canGenerate(),
      streaming: config.streamingEnabled,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

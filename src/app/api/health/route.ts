import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(): NextResponse {
  const apiFootballConfigured = Boolean(process.env.API_FOOTBALL_KEY?.trim());
  const status = apiFootballConfigured ? "ok" : "degraded";

  return NextResponse.json(
    {
      status,
      service: "goalcurrent.live",
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
      checks: {
        web: "ok",
        apiFootball: apiFootballConfigured ? "configured" : "not_configured",
      },
    },
    {
      status: apiFootballConfigured ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

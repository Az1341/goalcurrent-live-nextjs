import { NextRequest, NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { emptyQuerySchema } from "@/lib/validation/schemas";
import { captureRouteError, logInfo } from "@/lib/log";
import {
  communityShieldFixturesCacheControl,
  ssotCommunityShieldFixturesResponse,
} from "@/lib/community-shield/api";
import { getCached, setCached } from "@/lib/server/cache";

export const dynamic = "force-dynamic";

const ROUTE = "/api/community-shield/fixture";
const CACHE_KEY = "community-shield-fixture";

/**
 * SSOT-only route for the Community Shield trial.
 * No API-Football live polling — coverage not assumed for this one-off.
 * After 16 Aug: update src/data/community-shield/fixtures-2026.json manually
 * (same pattern as WC26 confirmed-results), then cache refresh picks it up.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const validated = validateGetQuery(request, emptyQuerySchema);
  if ("error" in validated) return validated.error;

  const cached = getCached(CACHE_KEY);
  if (cached) {
    logInfo(ROUTE, "CACHE HIT");
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": communityShieldFixturesCacheControl(),
      },
    });
  }

  logInfo(ROUTE, "CACHE MISS");

  try {
    const body = ssotCommunityShieldFixturesResponse();
    setCached(CACHE_KEY, body);
    return NextResponse.json(body, {
      headers: {
        "Cache-Control": communityShieldFixturesCacheControl(),
      },
    });
  } catch (error) {
    captureRouteError("api/community-shield/fixture", error);
    return NextResponse.json(
      {
        configured: true,
        competition: "FA Community Shield",
        season: 2026,
        fixtures: [],
        source: "fallback",
        fetchedAt: new Date().toISOString(),
        error: "Failed to load Community Shield fixture.",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}

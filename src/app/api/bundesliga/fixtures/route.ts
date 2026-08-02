import { NextRequest, NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { emptyQuerySchema } from "@/lib/validation/schemas";
import { captureRouteError, logInfo } from "@/lib/log";
import {
  fetchBundesligaFixtures,
  bundesligaFixturesCacheControl,
} from "@/lib/bundesliga/api";
import { getCached, setCached } from "@/lib/server/cache";

export const dynamic = "force-dynamic";

const ROUTE = "/api/bundesliga/fixtures";
const CACHE_KEY = "bundesliga-fixtures";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const validated = validateGetQuery(request, emptyQuerySchema);
  if ("error" in validated) return validated.error;

  const cached = getCached(CACHE_KEY);
  if (cached) {
    logInfo(ROUTE, "CACHE HIT");
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": bundesligaFixturesCacheControl(
          cached as Parameters<typeof bundesligaFixturesCacheControl>[0],
        ),
      },
    });
  }

  logInfo(ROUTE, "CACHE MISS");

  try {
    const body = await fetchBundesligaFixtures();
    setCached(CACHE_KEY, body);

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": bundesligaFixturesCacheControl(body),
      },
    });
  } catch (error) {
    captureRouteError("api/bundesliga/fixtures", error);

    return NextResponse.json(
      {
        configured: Boolean(process.env.API_FOOTBALL_KEY?.trim()),
        league: "Bundesliga",
        leagueId: 78,
        season: 2026,
        fixtures: [],
        source: "fallback",
        fetchedAt: new Date().toISOString(),
        error: "Failed to fetch Bundesliga fixtures.",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}

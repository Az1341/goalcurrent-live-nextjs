import { NextRequest, NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { emptyQuerySchema } from "@/lib/validation/schemas";
import { captureRouteError, logInfo } from "@/lib/log";
import { fetchPlFixtures, plFixturesCacheControl } from "@/lib/pl/api";
import { getCached, setCached } from "@/lib/server/cache";

export const dynamic = "force-dynamic";

const ROUTE = "/api/pl/fixtures";
const CACHE_KEY = "pl-fixtures";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const validated = validateGetQuery(request, emptyQuerySchema);
  if ("error" in validated) return validated.error;

  const cached = getCached(CACHE_KEY);
  if (cached) {
    logInfo(ROUTE, "CACHE HIT");
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": plFixturesCacheControl(
          cached as Parameters<typeof plFixturesCacheControl>[0],
        ),
      },
    });
  }

  logInfo(ROUTE, "CACHE MISS");

  try {
    const body = await fetchPlFixtures("en-GB");
    setCached(CACHE_KEY, body);

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": plFixturesCacheControl(body),
      },
    });
  } catch (error) {
    captureRouteError("api/pl/fixtures", error);

    return NextResponse.json(
      {
        configured: Boolean(process.env.API_FOOTBALL_KEY?.trim()),
        league: "Premier League",
        leagueId: 39,
        season: 2026,
        fixtures: [],
        source: "fallback",
        fetchedAt: new Date().toISOString(),
        error: "Failed to fetch Premier League fixtures.",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}

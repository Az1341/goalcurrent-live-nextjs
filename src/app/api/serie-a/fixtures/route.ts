import { NextRequest, NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { emptyQuerySchema } from "@/lib/validation/schemas";
import { captureRouteError, logInfo } from "@/lib/log";
import {
  fetchSerieAFixtures,
  serieAFixturesCacheControl,
} from "@/lib/serie-a/api";
import { getCached, setCached } from "@/lib/server/cache";

export const dynamic = "force-dynamic";

const ROUTE = "/api/serie-a/fixtures";
const CACHE_KEY = "serie-a-fixtures";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const validated = validateGetQuery(request, emptyQuerySchema);
  if ("error" in validated) return validated.error;

  const cached = getCached(CACHE_KEY);
  if (cached) {
    logInfo(ROUTE, "CACHE HIT");
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": serieAFixturesCacheControl(
          cached as Parameters<typeof serieAFixturesCacheControl>[0],
        ),
      },
    });
  }

  logInfo(ROUTE, "CACHE MISS");

  try {
    const body = await fetchSerieAFixtures();
    setCached(CACHE_KEY, body);

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": serieAFixturesCacheControl(body),
      },
    });
  } catch (error) {
    captureRouteError("api/serie-a/fixtures", error);

    return NextResponse.json(
      {
        configured: Boolean(process.env.API_FOOTBALL_KEY?.trim()),
        league: "Serie A",
        leagueId: 135,
        season: 2026,
        fixtures: [],
        source: "fallback",
        fetchedAt: new Date().toISOString(),
        error: "Failed to fetch Serie A fixtures.",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { emptyQuerySchema } from "@/lib/validation/schemas";
import { getStaleApiCache, setSuccessApiCache } from "@/lib/api-football/cache";
import { apiFootballErrorMessage } from "@/lib/api-football/errors";
import { respondApiFootballFailure } from "@/lib/api-football/route-errors";
import {
  fetchFacupFixtures,
  facupFixturesCacheControl,
} from "@/lib/facup/api";
import { facupFixturesCacheKey } from "@/lib/facup/cache-keys";
import {
  FACUP_DISPLAY_NAME,
  FACUP_LEAGUE_ID,
  FACUP_SEASON,
} from "@/lib/facup/constants";
import type { FacupFixturesApiResponse } from "@/lib/facup/types";

export const dynamic = "force-dynamic";

const ROUTE = "api/facup/fixtures";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const validated = validateGetQuery(request, emptyQuerySchema);
  if ("error" in validated) return validated.error;

  const cacheKey = facupFixturesCacheKey();

  try {
    const body = await fetchFacupFixtures();
    setSuccessApiCache(cacheKey, body);
    return NextResponse.json(body, {
      headers: { "Cache-Control": facupFixturesCacheControl(body) },
    });
  } catch (error) {
    const staleBody = getStaleApiCache<FacupFixturesApiResponse>(cacheKey);
    return respondApiFootballFailure({
      route: ROUTE,
      error,
      staleBody,
      buildBody: (code, message, stale): FacupFixturesApiResponse => ({
        configured: Boolean(process.env.API_FOOTBALL_KEY?.trim()),
        competitionKey: "facup",
        league: FACUP_DISPLAY_NAME,
        leagueId: FACUP_LEAGUE_ID,
        season: FACUP_SEASON,
        fixtures: stale && staleBody ? staleBody.fixtures : [],
        standingsSupported: false,
        source: "fallback",
        fetchedAt:
          stale && staleBody ? staleBody.fetchedAt : new Date().toISOString(),
        error: message || apiFootballErrorMessage(code),
        errorCode: code,
        stale,
      }),
    });
  }
}
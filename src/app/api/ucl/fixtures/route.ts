import { NextRequest, NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { emptyQuerySchema } from "@/lib/validation/schemas";
import { getStaleApiCache, setSuccessApiCache } from "@/lib/api-football/cache";
import { apiFootballErrorMessage } from "@/lib/api-football/errors";
import { respondApiFootballFailure } from "@/lib/api-football/route-errors";
import {
  fetchUclFixtures,
  uclFixturesCacheControl,
} from "@/lib/ucl/api";
import { uclFixturesCacheKey } from "@/lib/ucl/cache-keys";
import {
  UCL_DISPLAY_NAME,
  UCL_LEAGUE_ID,
  UCL_SEASON,
} from "@/lib/ucl/constants";
import type { UclFixturesApiResponse } from "@/lib/ucl/types";

export const dynamic = "force-dynamic";

const ROUTE = "api/ucl/fixtures";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const validated = validateGetQuery(request, emptyQuerySchema);
  if ("error" in validated) return validated.error;

  const cacheKey = uclFixturesCacheKey();

  try {
    const body = await fetchUclFixtures();
    setSuccessApiCache(cacheKey, body);
    return NextResponse.json(body, {
      headers: { "Cache-Control": uclFixturesCacheControl(body) },
    });
  } catch (error) {
    const staleBody = getStaleApiCache<UclFixturesApiResponse>(cacheKey);
    return respondApiFootballFailure({
      route: ROUTE,
      error,
      staleBody,
      buildBody: (code, message, stale): UclFixturesApiResponse => ({
        configured: Boolean(process.env.API_FOOTBALL_KEY?.trim()),
        competitionKey: "ucl",
        league: UCL_DISPLAY_NAME,
        leagueId: UCL_LEAGUE_ID,
        season: UCL_SEASON,
        fixtures: stale && staleBody ? staleBody.fixtures : [],
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
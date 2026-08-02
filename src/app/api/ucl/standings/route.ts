import { NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { emptyQuerySchema } from "@/lib/validation/schemas";
import { getStaleApiCache, setSuccessApiCache } from "@/lib/api-football/cache";
import { apiFootballErrorMessage } from "@/lib/api-football/errors";
import { respondApiFootballFailure } from "@/lib/api-football/route-errors";
import {
  fetchUclStandings,
  uclStandingsCacheControl,
} from "@/lib/ucl/api";
import { uclStandingsCacheKey } from "@/lib/ucl/cache-keys";
import {
  UCL_DISPLAY_NAME,
  UCL_LEAGUE_ID,
  UCL_SEASON,
} from "@/lib/ucl/constants";
import type { UclStandingsApiResponse } from "@/lib/ucl/types";

export const dynamic = "force-dynamic";

const ROUTE = "api/ucl/standings";

export async function GET(request: Request): Promise<NextResponse> {
  const validated = validateGetQuery(request, emptyQuerySchema);
  if ("error" in validated) return validated.error;

  const cacheKey = uclStandingsCacheKey();

  try {
    const body = await fetchUclStandings();
    setSuccessApiCache(cacheKey, body);
    return NextResponse.json(body, {
      headers: { "Cache-Control": uclStandingsCacheControl(body) },
    });
  } catch (error) {
    const staleBody = getStaleApiCache<UclStandingsApiResponse>(cacheKey);
    return respondApiFootballFailure({
      route: ROUTE,
      error,
      staleBody,
      buildBody: (code, message, stale): UclStandingsApiResponse => ({
        configured: Boolean(process.env.API_FOOTBALL_KEY?.trim()),
        competitionKey: "ucl",
        league: UCL_DISPLAY_NAME,
        leagueId: UCL_LEAGUE_ID,
        season: UCL_SEASON,
        standings: stale && staleBody ? staleBody.standings : [],
        standingsAvailable: Boolean(
          stale && staleBody?.standingsAvailable && staleBody.standings.length,
        ),
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
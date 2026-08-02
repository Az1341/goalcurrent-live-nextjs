import { NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { emptyQuerySchema } from "@/lib/validation/schemas";
import { getStaleApiCache, setSuccessApiCache } from "@/lib/api-football/cache";
import { apiFootballErrorMessage } from "@/lib/api-football/errors";
import { respondApiFootballFailure } from "@/lib/api-football/route-errors";
import type { DomesticLeagueStandingsResponse } from "@/lib/domestic-league/types";
import {
  fetchBundesligaStandings,
  bundesligaStandingsCacheControl,
} from "@/lib/bundesliga/api";
import {
  BUNDESLIGA_LEAGUE_ID,
  BUNDESLIGA_LEAGUE_NAME,
  BUNDESLIGA_SEASON,
} from "@/lib/bundesliga/constants";

export const dynamic = "force-dynamic";

const ROUTE = "api/bundesliga/standings";
const CACHE_KEY = ROUTE;

export async function GET(request: Request): Promise<NextResponse> {
  const validated = validateGetQuery(request, emptyQuerySchema);
  if ("error" in validated) return validated.error;

  try {
    const body = await fetchBundesligaStandings();
    setSuccessApiCache(CACHE_KEY, body);

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": bundesligaStandingsCacheControl(body),
      },
    });
  } catch (error) {
    const staleBody = getStaleApiCache<DomesticLeagueStandingsResponse>(CACHE_KEY);

    return respondApiFootballFailure({
      route: ROUTE,
      error,
      staleBody,
      buildBody: (code, message, stale): DomesticLeagueStandingsResponse => ({
        configured: Boolean(process.env.API_FOOTBALL_KEY?.trim()),
        league: BUNDESLIGA_LEAGUE_NAME,
        leagueId: BUNDESLIGA_LEAGUE_ID,
        season: BUNDESLIGA_SEASON,
        standings: stale && staleBody ? staleBody.standings : [],
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

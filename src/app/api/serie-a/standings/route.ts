import { NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { emptyQuerySchema } from "@/lib/validation/schemas";
import { getStaleApiCache, setSuccessApiCache } from "@/lib/api-football/cache";
import { apiFootballErrorMessage } from "@/lib/api-football/errors";
import { respondApiFootballFailure } from "@/lib/api-football/route-errors";
import type { DomesticLeagueStandingsResponse } from "@/lib/domestic-league/types";
import {
  fetchSerieAStandings,
  serieAStandingsCacheControl,
} from "@/lib/serie-a/api";
import {
  SERIEA_LEAGUE_ID,
  SERIEA_LEAGUE_NAME,
  SERIEA_SEASON,
} from "@/lib/serie-a/constants";

export const dynamic = "force-dynamic";

const ROUTE = "api/serie-a/standings";
const CACHE_KEY = ROUTE;

export async function GET(request: Request): Promise<NextResponse> {
  const validated = validateGetQuery(request, emptyQuerySchema);
  if ("error" in validated) return validated.error;

  try {
    const body = await fetchSerieAStandings();
    setSuccessApiCache(CACHE_KEY, body);

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": serieAStandingsCacheControl(body),
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
        league: SERIEA_LEAGUE_NAME,
        leagueId: SERIEA_LEAGUE_ID,
        season: SERIEA_SEASON,
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

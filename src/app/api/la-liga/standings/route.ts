import { NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { emptyQuerySchema } from "@/lib/validation/schemas";
import { getStaleApiCache, setSuccessApiCache } from "@/lib/api-football/cache";
import { apiFootballErrorMessage } from "@/lib/api-football/errors";
import { respondApiFootballFailure } from "@/lib/api-football/route-errors";
import type { DomesticLeagueStandingsResponse } from "@/lib/domestic-league/types";
import {
  fetchLaLigaStandings,
  laLigaStandingsCacheControl,
} from "@/lib/la-liga/api";
import {
  LALIGA_LEAGUE_ID,
  LALIGA_LEAGUE_NAME,
  LALIGA_SEASON,
} from "@/lib/la-liga/constants";

export const dynamic = "force-dynamic";

const ROUTE = "api/la-liga/standings";
const CACHE_KEY = ROUTE;

export async function GET(request: Request): Promise<NextResponse> {
  const validated = validateGetQuery(request, emptyQuerySchema);
  if ("error" in validated) return validated.error;

  try {
    const body = await fetchLaLigaStandings();
    setSuccessApiCache(CACHE_KEY, body);

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": laLigaStandingsCacheControl(body),
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
        league: LALIGA_LEAGUE_NAME,
        leagueId: LALIGA_LEAGUE_ID,
        season: LALIGA_SEASON,
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

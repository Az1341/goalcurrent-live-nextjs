import { NextRequest, NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { unlStandingsQuerySchema } from "@/lib/validation/schemas";
import { getStaleApiCache, setSuccessApiCache } from "@/lib/api-football/cache";
import { apiFootballErrorMessage } from "@/lib/api-football/errors";
import { respondApiFootballFailure } from "@/lib/api-football/route-errors";
import {
  fetchUnlStandings,
  unlStandingsCacheControl,
} from "@/lib/unl/api";
import { unlStandingsCacheKey } from "@/lib/unl/cache-keys";
import {
  UNL_DISPLAY_NAME,
  UNL_LEAGUE_ID,
  UNL_SEASON,
} from "@/lib/unl/constants";
import type { UnlStandingsApiResponse } from "@/lib/unl/types";

export const dynamic = "force-dynamic";

const ROUTE = "api/unl/standings";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const validated = validateGetQuery(request, unlStandingsQuerySchema);
  if ("error" in validated) return validated.error;

  const group = validated.data.group?.trim().toLowerCase() || undefined;
  const cacheKey = unlStandingsCacheKey(UNL_LEAGUE_ID, UNL_SEASON, group);

  try {
    const body = await fetchUnlStandings(group);
    setSuccessApiCache(cacheKey, body);
    return NextResponse.json(body, {
      headers: { "Cache-Control": unlStandingsCacheControl(body) },
    });
  } catch (error) {
    const staleBody = getStaleApiCache<UnlStandingsApiResponse>(cacheKey);
    return respondApiFootballFailure({
      route: ROUTE,
      error,
      staleBody,
      buildBody: (code, message, stale): UnlStandingsApiResponse => ({
        configured: Boolean(process.env.API_FOOTBALL_KEY?.trim()),
        competitionKey: "unl",
        league: UNL_DISPLAY_NAME,
        leagueId: UNL_LEAGUE_ID,
        season: UNL_SEASON,
        standings: stale && staleBody ? staleBody.standings : [],
        standingsAvailable: Boolean(
          stale && staleBody?.standingsAvailable && staleBody.standings.length,
        ),
        groupId: stale && staleBody ? staleBody.groupId : null,
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
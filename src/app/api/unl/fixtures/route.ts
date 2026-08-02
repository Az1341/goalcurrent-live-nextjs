import { NextRequest, NextResponse } from "next/server";
import { validateGetQuery } from "@/lib/api/response";
import { emptyQuerySchema } from "@/lib/validation/schemas";
import { getStaleApiCache, setSuccessApiCache } from "@/lib/api-football/cache";
import { apiFootballErrorMessage } from "@/lib/api-football/errors";
import { respondApiFootballFailure } from "@/lib/api-football/route-errors";
import {
  fetchUnlFixtures,
  unlFixturesCacheControl,
} from "@/lib/unl/api";
import { unlFixturesCacheKey } from "@/lib/unl/cache-keys";
import {
  UNL_DISPLAY_NAME,
  UNL_LEAGUE_ID,
  UNL_SEASON,
} from "@/lib/unl/constants";
import type { UnlFixturesApiResponse } from "@/lib/unl/types";

export const dynamic = "force-dynamic";

const ROUTE = "api/unl/fixtures";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const validated = validateGetQuery(request, emptyQuerySchema);
  if ("error" in validated) return validated.error;

  const cacheKey = unlFixturesCacheKey();

  try {
    const body = await fetchUnlFixtures();
    setSuccessApiCache(cacheKey, body);
    return NextResponse.json(body, {
      headers: { "Cache-Control": unlFixturesCacheControl(body) },
    });
  } catch (error) {
    const staleBody = getStaleApiCache<UnlFixturesApiResponse>(cacheKey);
    return respondApiFootballFailure({
      route: ROUTE,
      error,
      staleBody,
      buildBody: (code, message, stale): UnlFixturesApiResponse => ({
        configured: Boolean(process.env.API_FOOTBALL_KEY?.trim()),
        competitionKey: "unl",
        league: UNL_DISPLAY_NAME,
        leagueId: UNL_LEAGUE_ID,
        season: UNL_SEASON,
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
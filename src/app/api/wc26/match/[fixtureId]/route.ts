import { NextRequest, NextResponse } from "next/server";
import { respondError } from "@/lib/api/response";
import { getFixtureById } from "@/data/wc26";
import { wc26FixtureIdSchema } from "@/lib/validation/schemas";
import { getStaleApiCache, setSuccessApiCache } from "@/lib/api-football/cache";
import { apiFootballErrorMessage } from "@/lib/api-football/errors";
import { respondApiFootballFailure } from "@/lib/api-football/route-errors";
import {
  fetchWc26MatchDetail,
  resolveTrustedWc26ApiFixtureId,
} from "@/lib/server/wc26-match-detail";
import { getCached, setCached } from "@/lib/server/cache";
import { isLiveMatchStatus } from "@/lib/wc26-live";
import type { MatchDetailPayload } from "@/types/match-detail";

export const dynamic = "force-dynamic";

const LIVE_MATCH_CACHE_TTL_MS = 15_000;
const MATCH_CACHE_TTL_MS = 30_000;

function matchCacheControl(live: boolean): string {
  if (live) {
    return "s-maxage=10, stale-while-revalidate=5";
  }
  return "s-maxage=30, stale-while-revalidate=15";
}

type RouteParams = {
  params: Promise<{ fixtureId: string }>;
};

function parseOptionalApiFixtureId(raw: string | null): number | undefined {
  if (!raw) {
    return undefined;
  }
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function isLiveDetailRequest(
  fixtureId: string,
  knownApiFixtureId?: number,
): boolean {
  if (knownApiFixtureId != null) {
    return true;
  }
  const fixture = getFixtureById(fixtureId);
  return fixture ? isLiveMatchStatus(fixture.status) : false;
}

function emptyPayload(fixtureId: string): MatchDetailPayload {
  return {
    fixtureId,
    configured: Boolean(process.env.API_FOOTBALL_KEY?.trim()),
    apiAvailable: false,
    fetchedAt: new Date().toISOString(),
    events: [],
    lineups: { home: null, away: null },
    statistics: [],
    playerStats: [],
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { fixtureId: rawId } = await params;
  const fixtureParsed = wc26FixtureIdSchema.safeParse(decodeURIComponent(rawId));
  if (!fixtureParsed.success) {
    return respondError("invalid_fixture_id", "Invalid fixture id.", 400);
  }
  const fixtureId = fixtureParsed.data;
  const queryApiFixtureId = parseOptionalApiFixtureId(
    request.nextUrl.searchParams.get("apiFixtureId"),
  );

  if (!getFixtureById(fixtureId)) {
    return respondError("fixture_not_found", "Fixture not found.", 404);
  }

  // BE-004 — never trust unbound apiFixtureId for upstream match fan-out.
  const trusted = await resolveTrustedWc26ApiFixtureId(
    fixtureId,
    queryApiFixtureId,
  );
  if (!trusted.ok) {
    return respondError(trusted.code, trusted.message, 400);
  }
  const knownApiFixtureId = trusted.apiFixtureId;
  const liveHint = isLiveDetailRequest(fixtureId, knownApiFixtureId);

  const cacheKey = knownApiFixtureId
    ? `wc26-match:${fixtureId}:${knownApiFixtureId}`
    : `wc26-match:${fixtureId}`;

  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached as MatchDetailPayload, {
      headers: { "Cache-Control": matchCacheControl(liveHint) },
    });
  }

  try {
    const detail = await fetchWc26MatchDetail(fixtureId, knownApiFixtureId);
    const ttlMs = detail.apiAvailable
      ? liveHint
        ? LIVE_MATCH_CACHE_TTL_MS
        : MATCH_CACHE_TTL_MS
      : 5_000;
    setSuccessApiCache(cacheKey, detail, ttlMs);
    setCached(cacheKey, detail, ttlMs);

    return NextResponse.json(detail, {
      headers: { "Cache-Control": matchCacheControl(liveHint) },
    });
  } catch (error) {
    const staleBody = getStaleApiCache<MatchDetailPayload>(cacheKey);

    return respondApiFootballFailure({
      route: "api/wc26/match",
      error,
      staleBody,
      buildBody: (code, message, stale) => ({
        ...(stale && staleBody ? staleBody : emptyPayload(fixtureId)),
        error: code,
        message: message || apiFootballErrorMessage(code),
        stale,
        apiAvailable: false,
      }),
      cacheControl: "no-store",
    });
  }
}

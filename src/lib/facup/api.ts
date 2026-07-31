import { apiFootballFetch, isApiFootballConfigured } from "@/lib/api-football/client";
import {
  ApiFootballAuthError,
  apiFootballClientAuthErrorMessage,
  apiFootballErrorMessage,
  ApiFootballRateLimitError,
} from "@/lib/api-football/errors";
import {
  FACUP_DISPLAY_NAME,
  FACUP_FIXTURES_CACHE_ACTIVE,
  FACUP_FIXTURES_CACHE_EMPTY,
  FACUP_LEAGUE_ID,
  FACUP_SEASON,
} from "@/lib/facup/constants";
import {
  isFinishedFacupStatus,
  mapFacupFixtureStatus,
  mapFacupRound,
  sanitiseFacupProviderError,
} from "@/lib/facup/contract";
import type {
  FacupDataSource,
  FacupFixtureRow,
  FacupFixturesApiResponse,
} from "@/lib/facup/types";

type ApiFootballFixtureItem = {
  fixture: {
    id: number;
    date: string | null;
    status: { short: string; elapsed: number | null };
    venue?: { name?: string | null; city?: string | null } | null;
  };
  league: { round?: string | null; id?: number; season?: number };
  teams: {
    home: { id: number; name: string; logo: string | null };
    away: { id: number; name: string; logo: string | null };
  };
  goals: { home: number | null; away: number | null };
  score?: {
    penalty?: { home: number | null; away: number | null } | null;
  } | null;
};

export function isFacupApiConfigured(): boolean {
  return isApiFootballConfigured();
}

function baseFixtures(
  source: FacupDataSource,
  overrides: Partial<FacupFixturesApiResponse> = {},
): FacupFixturesApiResponse {
  return {
    configured: isFacupApiConfigured(),
    competitionKey: "facup",
    league: FACUP_DISPLAY_NAME,
    leagueId: FACUP_LEAGUE_ID,
    season: FACUP_SEASON,
    fixtures: [],
    standingsSupported: false,
    source,
    fetchedAt: new Date().toISOString(),
    ...overrides,
  };
}

function formatVenue(
  venue: ApiFootballFixtureItem["fixture"]["venue"],
): string | null {
  if (!venue) return null;
  const parts = [venue.name, venue.city].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function ownsFacupFixture(item: ApiFootballFixtureItem): boolean {
  const leagueId = item.league?.id;
  const season = item.league?.season;
  if (leagueId != null && leagueId !== FACUP_LEAGUE_ID) return false;
  if (season != null && season !== FACUP_SEASON) return false;
  return true;
}

function normalizeFixture(item: ApiFootballFixtureItem): FacupFixtureRow | null {
  if (!ownsFacupFixture(item)) return null;
  const status = mapFacupFixtureStatus(item.fixture.status.short);
  const roundMeta = mapFacupRound(item.league.round);
  const finishedOrLive = isFinishedFacupStatus(status) || status === "LIVE";
  const kickoff =
    item.fixture.date && !Number.isNaN(new Date(item.fixture.date).getTime())
      ? new Date(item.fixture.date).toISOString()
      : null;

  return {
    fixtureId: item.fixture.id,
    kickoffUtc: kickoff,
    round: item.league.round ?? null,
    roundKind: roundMeta.kind,
    roundLabel: roundMeta.label,
    venue: formatVenue(item.fixture.venue),
    homeTeamId: item.teams.home.id,
    homeTeamName: item.teams.home.name || "TBC",
    homeTeamLogo: item.teams.home.logo || null,
    awayTeamId: item.teams.away.id,
    awayTeamName: item.teams.away.name || "TBC",
    awayTeamLogo: item.teams.away.logo || null,
    status,
    statusShort: item.fixture.status.short,
    elapsed: item.fixture.status.elapsed,
    homeScore: finishedOrLive ? item.goals.home : null,
    awayScore: finishedOrLive ? item.goals.away : null,
    penaltyHome: item.score?.penalty?.home ?? null,
    penaltyAway: item.score?.penalty?.away ?? null,
    isReplay: roundMeta.isReplay,
  };
}

export async function fetchFacupFixtures(): Promise<FacupFixturesApiResponse> {
  if (!isFacupApiConfigured()) {
    return baseFixtures("fallback", { configured: false });
  }

  try {
    const path = `/fixtures?league=${FACUP_LEAGUE_ID}&season=${FACUP_SEASON}&timezone=UTC`;
    const { data } = await apiFootballFetch<ApiFootballFixtureItem[]>(path);
    const fixtures = (data ?? [])
      .map(normalizeFixture)
      .filter((row): row is FacupFixtureRow => row !== null)
      .sort((a, b) => {
        const at = a.kickoffUtc ? new Date(a.kickoffUtc).getTime() : Number.MAX_SAFE_INTEGER;
        const bt = b.kickoffUtc ? new Date(b.kickoffUtc).getTime() : Number.MAX_SAFE_INTEGER;
        return at - bt;
      });

    if (!fixtures.length) {
      return baseFixtures("fallback", { configured: true, fixtures: [] });
    }

    return baseFixtures("api-football", { configured: true, fixtures });
  } catch (error) {
    if (error instanceof ApiFootballRateLimitError) {
      return baseFixtures("fallback", {
        configured: true,
        error: apiFootballErrorMessage("rate_limit"),
      });
    }
    if (error instanceof ApiFootballAuthError) {
      return baseFixtures("fallback", {
        configured: true,
        error: apiFootballClientAuthErrorMessage(),
      });
    }
    throw error;
  }
}

export function facupFixturesCacheControl(body: FacupFixturesApiResponse): string {
  if (!body.configured) return "no-store";
  if (body.fixtures.length > 0 && body.source === "api-football") {
    return `s-maxage=${FACUP_FIXTURES_CACHE_ACTIVE}, stale-while-revalidate=60`;
  }
  return `s-maxage=${FACUP_FIXTURES_CACHE_EMPTY}, stale-while-revalidate=300`;
}

export function facupClientErrorMessage(body: { error?: string }): string {
  return sanitiseFacupProviderError(body.error);
}
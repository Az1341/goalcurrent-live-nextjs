import { apiFootballFetch, isApiFootballConfigured } from "@/lib/api-football/client";
import {
  ApiFootballAuthError,
  apiFootballClientAuthErrorMessage,
  apiFootballErrorMessage,
  ApiFootballRateLimitError,
} from "@/lib/api-football/errors";
import {
  UCL_DISPLAY_NAME,
  UCL_FIXTURES_CACHE_ACTIVE,
  UCL_FIXTURES_CACHE_EMPTY,
  UCL_LEAGUE_ID,
  UCL_SEASON,
  UCL_STANDINGS_CACHE_ACTIVE,
  UCL_STANDINGS_CACHE_UNAVAILABLE,
} from "@/lib/ucl/constants";
import {
  isFinishedUclStatus,
  mapUclFixtureStatus,
  mapUclStage,
  sanitiseUclProviderError,
  uclStandingsSupported,
} from "@/lib/ucl/contract";
import type {
  UclFixtureRow,
  UclFixturesApiResponse,
  UclStandingRow,
  UclStandingsApiResponse,
  UclDataSource,
} from "@/lib/ucl/types";

type ApiFootballFixtureItem = {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
    venue?: { name?: string | null; city?: string | null } | null;
  };
  league: { round?: string | null; id?: number; season?: number };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
  score?: {
    fulltime?: { home: number | null; away: number | null } | null;
    extratime?: { home: number | null; away: number | null } | null;
    penalty?: { home: number | null; away: number | null } | null;
  } | null;
};

type ApiFootballStandingsEntry = {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  form: string | null;
  description: string | null;
  group?: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
};

export function isUclApiConfigured(): boolean {
  return isApiFootballConfigured();
}

function baseFixtures(
  source: UclDataSource,
  overrides: Partial<UclFixturesApiResponse> = {},
): UclFixturesApiResponse {
  return {
    configured: isUclApiConfigured(),
    competitionKey: "ucl",
    league: UCL_DISPLAY_NAME,
    leagueId: UCL_LEAGUE_ID,
    season: UCL_SEASON,
    fixtures: [],
    source,
    fetchedAt: new Date().toISOString(),
    ...overrides,
  };
}

function baseStandings(
  source: UclDataSource,
  overrides: Partial<UclStandingsApiResponse> = {},
): UclStandingsApiResponse {
  return {
    configured: isUclApiConfigured(),
    competitionKey: "ucl",
    league: UCL_DISPLAY_NAME,
    leagueId: UCL_LEAGUE_ID,
    season: UCL_SEASON,
    standings: [],
    standingsAvailable: false,
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

function ownsUclFixture(item: ApiFootballFixtureItem): boolean {
  const leagueId = item.league?.id;
  const season = item.league?.season;
  if (leagueId != null && leagueId !== UCL_LEAGUE_ID) return false;
  if (season != null && season !== UCL_SEASON) return false;
  return true;
}

function normalizeFixture(item: ApiFootballFixtureItem): UclFixtureRow | null {
  if (!ownsUclFixture(item)) return null;
  const status = mapUclFixtureStatus(item.fixture.status.short);
  const finishedOrLive = isFinishedUclStatus(status) || status === "LIVE";
  const homeScore = finishedOrLive ? item.goals.home : null;
  const awayScore = finishedOrLive ? item.goals.away : null;
  const penalty = item.score?.penalty;
  return {
    fixtureId: item.fixture.id,
    kickoffUtc: new Date(item.fixture.date).toISOString(),
    round: item.league.round ?? null,
    stage: mapUclStage(item.league.round),
    venue: formatVenue(item.fixture.venue),
    homeTeamId: item.teams.home.id,
    homeTeamName: item.teams.home.name,
    homeTeamLogo: item.teams.home.logo || null,
    awayTeamId: item.teams.away.id,
    awayTeamName: item.teams.away.name,
    awayTeamLogo: item.teams.away.logo || null,
    status,
    statusShort: item.fixture.status.short,
    elapsed: item.fixture.status.elapsed,
    homeScore,
    awayScore,
    aggregateHome: null,
    aggregateAway: null,
    penaltyHome: penalty?.home ?? null,
    penaltyAway: penalty?.away ?? null,
  };
}

function normalizeStanding(
  entry: ApiFootballStandingsEntry,
  group: string | null,
): UclStandingRow {
  return {
    rank: entry.rank,
    teamId: entry.team.id,
    teamName: entry.team.name,
    teamLogo: entry.team.logo || null,
    played: entry.all.played,
    win: entry.all.win,
    draw: entry.all.draw,
    lose: entry.all.lose,
    goalsFor: entry.all.goals.for,
    goalsAgainst: entry.all.goals.against,
    goalDiff: entry.goalsDiff,
    points: entry.points,
    form: entry.form,
    description: entry.description,
    group: entry.group ?? group,
  };
}

export async function fetchUclFixtures(): Promise<UclFixturesApiResponse> {
  if (!isUclApiConfigured()) {
    return baseFixtures("fallback", { configured: false });
  }

  try {
    const path = `/fixtures?league=${UCL_LEAGUE_ID}&season=${UCL_SEASON}&timezone=UTC`;
    const { data } = await apiFootballFetch<ApiFootballFixtureItem[]>(path);
    const fixtures = (data ?? [])
      .map(normalizeFixture)
      .filter((row): row is UclFixtureRow => row !== null)
      .sort(
        (a, b) =>
          new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime(),
      );

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

export async function fetchUclStandings(): Promise<UclStandingsApiResponse> {
  if (!isUclApiConfigured()) {
    return baseStandings("fallback", { configured: false });
  }

  try {
    const path = `/standings?league=${UCL_LEAGUE_ID}&season=${UCL_SEASON}`;
    const { data, results } = await apiFootballFetch<
      Array<{ league?: { standings?: ApiFootballStandingsEntry[][] } }>
    >(path);

    const groups = data?.[0]?.league?.standings;
    const standings: UclStandingRow[] = [];
    if (groups?.length) {
      groups.forEach((groupRows, index) => {
        const groupLabel =
          groupRows[0]?.group ?? (groups.length > 1 ? `Group ${index + 1}` : null);
        for (const entry of groupRows) {
          standings.push(normalizeStanding(entry, groupLabel));
        }
      });
    }

    const available = uclStandingsSupported(
      standings.length,
      standings.length && results ? "api-football" : "fallback",
    );

    if (!available) {
      return baseStandings("fallback", {
        configured: true,
        standings: [],
        standingsAvailable: false,
      });
    }

    return baseStandings("api-football", {
      configured: true,
      standings,
      standingsAvailable: true,
    });
  } catch (error) {
    if (error instanceof ApiFootballRateLimitError) {
      return baseStandings("fallback", {
        configured: true,
        error: apiFootballErrorMessage("rate_limit"),
        standingsAvailable: false,
      });
    }
    if (error instanceof ApiFootballAuthError) {
      return baseStandings("fallback", {
        configured: true,
        error: apiFootballClientAuthErrorMessage(),
        standingsAvailable: false,
      });
    }
    throw error;
  }
}

export function uclFixturesCacheControl(body: UclFixturesApiResponse): string {
  if (!body.configured) return "no-store";
  if (body.fixtures.length > 0 && body.source === "api-football") {
    return `s-maxage=${UCL_FIXTURES_CACHE_ACTIVE}, stale-while-revalidate=60`;
  }
  return `s-maxage=${UCL_FIXTURES_CACHE_EMPTY}, stale-while-revalidate=300`;
}

export function uclStandingsCacheControl(body: UclStandingsApiResponse): string {
  if (!body.configured) return "no-store";
  if (body.standingsAvailable && body.source === "api-football") {
    return `s-maxage=${UCL_STANDINGS_CACHE_ACTIVE}, stale-while-revalidate=60`;
  }
  return `s-maxage=${UCL_STANDINGS_CACHE_UNAVAILABLE}, stale-while-revalidate=300`;
}

export function uclClientErrorMessage(body: { error?: string }): string {
  return sanitiseUclProviderError(body.error);
}
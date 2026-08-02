import { apiFootballFetch, isApiFootballConfigured } from "@/lib/api-football/client";
import {
  ApiFootballAuthError,
  apiFootballClientAuthErrorMessage,
  apiFootballErrorMessage,
  ApiFootballNetworkError,
  ApiFootballRateLimitError,
  classifyApiFootballError,
} from "@/lib/api-football/errors";
import type {
  PlFixtureRow,
  PlFixtureStatus,
  PlStandingRow,
} from "@/lib/pl/types";
import type {
  DomesticLeagueConfig,
  DomesticLeagueFixturesResponse,
  DomesticLeagueSource,
  DomesticLeagueStandingsResponse,
} from "@/lib/domestic-league/types";

type ApiFootballFixtureItem = {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
    venue?: { name?: string | null; city?: string | null } | null;
  };
  league: { round?: string | null };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
};

type ApiFootballStandingsEntry = {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  form: string | null;
  status: string | null;
  description: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
};

function baseFixtures(
  config: DomesticLeagueConfig,
  source: DomesticLeagueSource,
  overrides: Partial<DomesticLeagueFixturesResponse> = {},
): DomesticLeagueFixturesResponse {
  return {
    configured: isApiFootballConfigured(),
    league: config.leagueName,
    leagueId: config.leagueId,
    season: config.season,
    fixtures: [],
    source,
    fetchedAt: new Date().toISOString(),
    ...overrides,
  };
}

function baseStandings(
  config: DomesticLeagueConfig,
  source: DomesticLeagueSource,
  overrides: Partial<DomesticLeagueStandingsResponse> = {},
): DomesticLeagueStandingsResponse {
  return {
    configured: isApiFootballConfigured(),
    league: config.leagueName,
    leagueId: config.leagueId,
    season: config.season,
    standings: [],
    source,
    fetchedAt: new Date().toISOString(),
    ...overrides,
  };
}


function fetchFailureMessage(error: unknown): string {
  if (error instanceof ApiFootballRateLimitError) {
    return apiFootballErrorMessage("rate_limit");
  }
  if (error instanceof ApiFootballAuthError) {
    return apiFootballClientAuthErrorMessage();
  }
  if (error instanceof ApiFootballNetworkError) {
    return apiFootballErrorMessage("network_error");
  }
  return apiFootballErrorMessage(classifyApiFootballError(error));
}

function mapFixtureStatus(short: string): PlFixtureStatus {
  const code = short.trim().toUpperCase();
  if (code === "FT" || code === "AET" || code === "PEN") return "FT";
  if (
    code === "1H" ||
    code === "2H" ||
    code === "HT" ||
    code === "ET" ||
    code === "BT" ||
    code === "P" ||
    code === "INT" ||
    code === "LIVE"
  ) {
    return "LIVE";
  }
  if (code === "PST") return "POSTPONED";
  if (code === "CANC" || code === "ABD" || code === "AWD" || code === "WO") {
    return "CANCELLED";
  }
  return "UPCOMING";
}

function parseMatchweek(round: string | null | undefined): number | null {
  if (!round) return null;
  const match = round.match(/(\d+)\s*$/);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

function formatVenue(
  venue: ApiFootballFixtureItem["fixture"]["venue"],
): string | null {
  if (!venue) return null;
  const parts = [venue.name, venue.city].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function normalizeFixture(item: ApiFootballFixtureItem): PlFixtureRow {
  const status = mapFixtureStatus(item.fixture.status.short);
  const hasScore =
    status === "FT" || status === "LIVE"
      ? item.goals.home !== null && item.goals.away !== null
      : false;

  return {
    fixtureId: item.fixture.id,
    kickoffUtc: new Date(item.fixture.date).toISOString(),
    matchweek: parseMatchweek(item.league.round),
    round: item.league.round ?? null,
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
    homeScore: hasScore ? item.goals.home : null,
    awayScore: hasScore ? item.goals.away : null,
    broadcaster: "—",
  };
}

function normalizeStanding(entry: ApiFootballStandingsEntry): PlStandingRow {
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
    status: entry.status,
    description: entry.description,
  };
}

export async function fetchDomesticLeagueFixtures(
  config: DomesticLeagueConfig,
): Promise<DomesticLeagueFixturesResponse> {
  if (!isApiFootballConfigured()) {
    return baseFixtures(config, "fallback", { configured: false });
  }

  try {
    const path = `/fixtures?league=${config.leagueId}&season=${config.season}&timezone=UTC`;
    const { data } = await apiFootballFetch<ApiFootballFixtureItem[]>(path);
    const fixtures = (data ?? [])
      .map(normalizeFixture)
      .sort(
        (a, b) =>
          new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime(),
      );

    if (!fixtures.length) {
      return baseFixtures(config, "fallback", {
        configured: true,
        fixtures: [],
      });
    }

    return baseFixtures(config, "api-football", {
      configured: true,
      fixtures,
    });
  } catch (error) {
    return baseFixtures(config, "fallback", {
      configured: true,
      error: fetchFailureMessage(error),
    });
  }
}

export async function fetchDomesticLeagueStandings(
  config: DomesticLeagueConfig,
): Promise<DomesticLeagueStandingsResponse> {
  if (!isApiFootballConfigured()) {
    return baseStandings(config, "fallback", { configured: false });
  }

  try {
    const path = `/standings?league=${config.leagueId}&season=${config.season}`;
    const { data, results } = await apiFootballFetch<
      Array<{ league?: { standings?: ApiFootballStandingsEntry[][] } }>
    >(path);

    const groups = data?.[0]?.league?.standings;
    const standings = groups?.length ? groups.flat().map(normalizeStanding) : [];

    if (!standings.length || results === 0) {
      return baseStandings(config, "fallback", {
        configured: true,
        standings: [],
      });
    }

    return baseStandings(config, "api-football", {
      configured: true,
      standings,
    });
  } catch (error) {
    return baseStandings(config, "fallback", {
      configured: true,
      error: fetchFailureMessage(error),
    });
  }
}

export function domesticFixturesCacheControl(
  config: DomesticLeagueConfig,
  body: DomesticLeagueFixturesResponse,
): string {
  if (!body.configured) return "no-store";
  if (body.fixtures.length > 0 && body.source === "api-football") {
    return `s-maxage=${config.fixturesCacheActive}, stale-while-revalidate=60`;
  }
  return `s-maxage=${config.fixturesCacheEmpty}, stale-while-revalidate=300`;
}

export function domesticStandingsCacheControl(
  config: DomesticLeagueConfig,
  body: DomesticLeagueStandingsResponse,
): string {
  if (!body.configured) return "no-store";
  if (body.standings.length > 0 && body.source === "api-football") {
    return `s-maxage=${config.standingsCacheActive}, stale-while-revalidate=60`;
  }
  return `s-maxage=${config.standingsCacheEmpty}, stale-while-revalidate=300`;
}

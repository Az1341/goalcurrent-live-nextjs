import { resolveStandingsWithClubFallback } from "@/lib/pl/standings-resolve";
import {
  PL_LEAGUE_ID,
  PL_LEAGUE_NAME,
  PL_SEASON,
} from "@/lib/pl/constants";
import { apiFootballFetch } from "@/lib/api-football/client";
import {
  ApiFootballAuthError,
  apiFootballClientAuthErrorMessage,
  ApiFootballRateLimitError,
} from "@/lib/api-football/errors";
import { resolvePlBroadcasterFromLocale } from "@/lib/pl/pl-broadcasters";
import type {
  PlFixtureRow,
  PlFixturesApiResponse,
  PlFixtureStatus,
  PlStandingRow,
  PlStandingsApiResponse,
  PlStandingsSource,
} from "@/lib/pl/types";

type ApiFootballStandingsEntry = {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
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
    goals: {
      for: number;
      against: number;
    };
  };
};

type ApiFootballStandingsResponse = {
  errors?: Record<string, string>;
  results?: number;
  response?: Array<{
    league?: {
      standings?: ApiFootballStandingsEntry[][];
    };
  }>;
};

function getApiKey(): string | undefined {
  return process.env.API_FOOTBALL_KEY?.trim() || undefined;
}

export function isPlApiConfigured(): boolean {
  return Boolean(getApiKey());
}

function baseResponse(
  source: PlStandingsSource,
  overrides: Partial<PlStandingsApiResponse> = {},
): PlStandingsApiResponse {
  return {
    configured: isPlApiConfigured(),
    league: PL_LEAGUE_NAME,
    leagueId: PL_LEAGUE_ID,
    season: PL_SEASON,
    standings: [],
    source,
    fetchedAt: new Date().toISOString(),
    ...overrides,
  };
}

function isAuthError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("token") ||
    lower.includes("key") ||
    lower.includes("missing application key") ||
    lower.includes("application key missing")
  );
}

function isQuotaError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("ratelimit") ||
    lower.includes("too many requests") ||
    lower.includes("request limit") ||
    lower.includes("429")
  );
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

function mapStandings(payload: ApiFootballStandingsResponse): PlStandingRow[] {
  const groups = payload.response?.[0]?.league?.standings;
  if (!groups?.length) {
    return [];
  }

  return groups.flat().map(normalizeStanding);
}

async function fetchStandingsFromApi(): Promise<PlStandingsApiResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return baseResponse("fallback", { configured: false });
  }

  try {
    const path = `/standings?league=${PL_LEAGUE_ID}&season=${PL_SEASON}`;
    const { data, results } = await apiFootballFetch<
      NonNullable<ApiFootballStandingsResponse["response"]>
    >(path);

    const payload: ApiFootballStandingsResponse = {
      response: data,
      results,
    };

    const standings = mapStandings(payload);

    if (!standings.length || results === 0) {
      return baseResponse("fallback", {
        configured: true,
        standings: [],
      });
    }

    return baseResponse("api-football", {
      configured: true,
      standings,
    });
  } catch (error) {
    if (error instanceof ApiFootballRateLimitError) {
      return baseResponse("fallback", {
        configured: true,
        error: "API rate limit reached. Please retry shortly.",
      });
    }

    if (error instanceof ApiFootballAuthError) {
      return baseResponse("fallback", {
        configured: true,
        error: apiFootballClientAuthErrorMessage(),
      });
    }

    throw error;
  }
}

export async function fetchPlStandings(): Promise<PlStandingsApiResponse> {
  if (!isPlApiConfigured()) {
    return baseResponse("fallback", { configured: false });
  }

  try {
    let body = await fetchStandingsFromApi();

    if (
      !body.standings.length &&
      !body.error?.toLowerCase().includes("rate limit") &&
      body.error !== apiFootballClientAuthErrorMessage() &&
      !body.error?.toLowerCase().includes("key")
    ) {
      let fixtures: PlFixtureRow[] = [];
      try {
        const fixturesBody = await fetchPlFixtures();
        fixtures = fixturesBody.fixtures;
      } catch {
        /* fixtures optional for club fallback */
      }
      body = await resolveStandingsWithClubFallback(body, fixtures);
    }

    return body;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (isQuotaError(message)) {
      return baseResponse("fallback", {
        configured: true,
        error: "API rate limit reached. Please retry shortly.",
      });
    }

    throw error;
  }
}

export function plStandingsCacheControl(
  body: PlStandingsApiResponse,
): string {
  if (!body.configured) {
    return "no-store";
  }

  if (body.standings.length > 0 && body.source === "api-football") {
    return "s-maxage=300, stale-while-revalidate=60";
  }

  return "s-maxage=3600, stale-while-revalidate=300";
}

type ApiFootballFixtureItem = {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      elapsed: number | null;
    };
    venue?: {
      name?: string | null;
      city?: string | null;
    } | null;
  };
  league: {
    round?: string | null;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

type ApiFootballFixturesResponse = {
  errors?: Record<string, string>;
  results?: number;
  paging?: {
    current: number;
    total: number;
  };
  response?: ApiFootballFixtureItem[];
};

function baseFixturesResponse(
  source: PlStandingsSource,
  overrides: Partial<PlFixturesApiResponse> = {},
): PlFixturesApiResponse {
  return {
    configured: isPlApiConfigured(),
    league: PL_LEAGUE_NAME,
    leagueId: PL_LEAGUE_ID,
    season: PL_SEASON,
    fixtures: [],
    source,
    fetchedAt: new Date().toISOString(),
    ...overrides,
  };
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

function normalizeFixture(
  item: ApiFootballFixtureItem,
  locale: string,
): PlFixtureRow {
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
    broadcaster: resolvePlBroadcasterFromLocale(locale),
  };
}

async function fetchFixturesFromApi(locale: string): Promise<PlFixturesApiResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return baseFixturesResponse("fallback", { configured: false });
  }

  try {
    const path = `/fixtures?league=${PL_LEAGUE_ID}&season=${PL_SEASON}&timezone=UTC`;
    const { data } = await apiFootballFetch<NonNullable<ApiFootballFixturesResponse["response"]>>(
      path,
    );

    const fixtures = (data ?? [])
      .map((item) => normalizeFixture(item, locale))
      .sort(
        (a, b) =>
          new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime(),
      );

    if (!fixtures.length) {
      return baseFixturesResponse("fallback", {
        configured: true,
        fixtures: [],
      });
    }

    return baseFixturesResponse("api-football", {
      configured: true,
      fixtures,
    });
  } catch (error) {
    if (error instanceof ApiFootballRateLimitError) {
      return baseFixturesResponse("fallback", {
        configured: true,
        error: "API rate limit reached. Please retry shortly.",
      });
    }

    if (error instanceof ApiFootballAuthError) {
      return baseFixturesResponse("fallback", {
        configured: true,
        error: apiFootballClientAuthErrorMessage(),
      });
    }

    throw error;
  }
}

export async function fetchPlFixtures(
  locale = "en-GB",
): Promise<PlFixturesApiResponse> {
  if (!isPlApiConfigured()) {
    return baseFixturesResponse("fallback", { configured: false });
  }

  try {
    return await fetchFixturesFromApi(locale);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("429") || isQuotaError(message)) {
      return baseFixturesResponse("fallback", {
        configured: true,
        error: "API rate limit reached. Please retry shortly.",
      });
    }

    if (message.includes("403")) {
      return baseFixturesResponse("fallback", {
        configured: true,
        error: apiFootballClientAuthErrorMessage(),
      });
    }

    throw error;
  }
}

export function plFixturesCacheControl(body: PlFixturesApiResponse): string {
  if (!body.configured) {
    return "no-store";
  }

  if (body.fixtures.length > 0 && body.source === "api-football") {
    return "s-maxage=300, stale-while-revalidate=60";
  }

  return "s-maxage=3600, stale-while-revalidate=300";
}

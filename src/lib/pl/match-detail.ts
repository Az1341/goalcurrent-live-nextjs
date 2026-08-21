import { resolveDisplayStandings } from "@/lib/pl/standings-display";
import type {
  MatchEventItem,
  MatchLineupPlayer,
  MatchLineupSide,
  MatchStatisticPair,
} from "@/types/match-detail";
import { fetchPlStandings } from "@/lib/pl/api";
import {
  apiFootballFetch,
  isPlApiConfigured,
  plBaseEnvelope,
} from "@/lib/pl/api-core";
import {
  getStaleApiCache,
  setSuccessApiCache,
} from "@/lib/api-football/cache";
import { getCached } from "@/lib/server/cache";
import { PL_LEAGUE_ID, PL_SEASON } from "@/lib/pl/constants";
import { resolvePlBroadcasterFromLocale } from "@/lib/pl/pl-broadcasters";
import type {
  PlFixtureRow,
  PlFixtureStatus,
  PlMatchApiResponse,
  PlMatchH2HRow,
  PlStandingRow,
} from "@/lib/pl/types";

/** Fresh TTL for live PL match detail (instance cache). */
export const PL_MATCH_LIVE_TTL_MS = 30_000;
/** Fresh TTL for upcoming PL match detail. */
export const PL_MATCH_UPCOMING_TTL_MS = 300_000;
/** Fresh TTL for finished PL match detail. */
export const PL_MATCH_FINISHED_TTL_MS = 900_000;

const plMatchDetailInflight = new Map<string, Promise<PlMatchApiResponse>>();

export function plMatchDetailCacheKey(fixtureId: number): string {
  return `pl:match:${fixtureId}`;
}

export function plMatchDetailFreshTtlMs(body: PlMatchApiResponse): number {
  if (body.fixture?.status === "LIVE") return PL_MATCH_LIVE_TTL_MS;
  if (body.fixture?.status === "UPCOMING") return PL_MATCH_UPCOMING_TTL_MS;
  if (body.fixture?.status === "FT") return PL_MATCH_FINISHED_TTL_MS;
  return PL_MATCH_LIVE_TTL_MS;
}

const PL_STAT_LABELS: Record<string, string> = {
  ball_possession: "Possession",
  total_shots: "Total shots",
  shots_on_goal: "Shots on target",
  shots_off_goal: "Shots off target",
  blocked_shots: "Blocked shots",
  corner_kicks: "Corners",
  offsides: "Offsides",
  fouls: "Fouls",
  yellow_cards: "Yellow cards",
  red_cards: "Red cards",
  goalkeeper_saves: "Saves",
  total_passes: "Total passes",
  passes_accurate: "Accurate passes",
  expected_goals: "Expected goals",
};

const STAT_KEYS = [
  "ball_possession",
  "total_shots",
  "shots_on_goal",
  "corner_kicks",
  "fouls",
  "yellow_cards",
  "red_cards",
  "goalkeeper_saves",
] as const;

type ApiFixtureDetailItem = {
  fixture: {
    id: number;
    date: string;
    referee: string | null;
    status: { short: string; elapsed: number | null };
    venue?: { name?: string | null; city?: string | null } | null;
  };
  league: { id: number; season: number; round?: string | null };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
};

type ApiEventRow = {
  time: { elapsed: number | null; extra: number | null };
  team: { id: number; name: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null } | null;
  type: string;
  detail: string;
  comments: string | null;
};

type ApiLineupRow = {
  team: { id: number; name: string; logo: string };
  coach: { name: string | null } | null;
  formation: string | null;
  startXI: Array<{
    player: { id: number; name: string; number: number | null; pos: string | null };
  }>;
  substitutes: Array<{
    player: { id: number; name: string; number: number | null; pos: string | null };
  }>;
};

type ApiStatRow = {
  team: { id: number; name: string };
  statistics: Array<{ type: string; value: string | number | null }>;
};

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

function normalizeFixtureRow(
  item: ApiFixtureDetailItem,
  locale: string,
): PlFixtureRow & { referee: string | null; venueCity: string | null } {
  const status = mapFixtureStatus(item.fixture.status.short);
  const hasScore =
    status === "FT" || status === "LIVE"
      ? item.goals.home !== null && item.goals.away !== null
      : false;

  const venueName = item.fixture.venue?.name ?? null;
  const venueCity = item.fixture.venue?.city ?? null;
  const venueParts = [venueName, venueCity].filter(Boolean);

  return {
    fixtureId: item.fixture.id,
    kickoffUtc: new Date(item.fixture.date).toISOString(),
    matchweek: parseMatchweek(item.league.round),
    round: item.league.round ?? null,
    venue: venueParts.length ? venueParts.join(", ") : null,
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
    referee: item.fixture.referee,
    venueCity,
  };
}

function mapEvents(rows: ApiEventRow[]): MatchEventItem[] {
  return rows.map((event) => ({
    minute: event.time.elapsed,
    extra: event.time.extra,
    teamName: event.team.name,
    playerName: event.player.name,
    assistName: event.assist?.name ?? null,
    type: event.type,
    detail: event.detail,
  }));
}

function mapPlayers(
  players: ApiLineupRow["startXI"],
): MatchLineupPlayer[] {
  return players.map((entry) => ({
    name: entry.player.name,
    number: entry.player.number,
    position: entry.player.pos,
  }));
}

function mapLineupSide(row: ApiLineupRow): MatchLineupSide {
  return {
    teamName: row.team.name,
    formation: row.formation,
    coach: row.coach?.name ?? null,
    startXI: mapPlayers(row.startXI ?? []),
    substitutes: mapPlayers(row.substitutes ?? []),
  };
}

function statKey(type: string): string {
  return type.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function mapStatistics(
  rows: ApiStatRow[],
  homeTeamName: string,
  awayTeamName: string,
): MatchStatisticPair[] {
  const byTeam = new Map<string, Record<string, string | number | null>>();
  for (const row of rows) {
    const data: Record<string, string | number | null> = {};
    for (const item of row.statistics ?? []) {
      data[statKey(item.type)] = item.value;
    }
    byTeam.set(row.team.name, data);
  }

  const homeStats = byTeam.get(homeTeamName) ?? {};
  const awayStats = byTeam.get(awayTeamName) ?? {};

  return STAT_KEYS.filter(
    (key) => homeStats[key] != null || awayStats[key] != null,
  ).map((key) => ({
    key,
    label: PL_STAT_LABELS[key] ?? key,
    home: homeStats[key] ?? null,
    away: awayStats[key] ?? null,
  }));
}

function resolveLineupSides(
  rows: ApiLineupRow[],
  homeTeamId: number,
  awayTeamId: number,
): { home: MatchLineupSide | null; away: MatchLineupSide | null } {
  let home: MatchLineupSide | null = null;
  let away: MatchLineupSide | null = null;

  for (const row of rows) {
    const side = mapLineupSide(row);
    if (row.team.id === homeTeamId) home = side;
    else if (row.team.id === awayTeamId) away = side;
  }

  if (rows.length === 2 && (!home || !away)) {
    const mapped = rows.map(mapLineupSide);
    return { home: home ?? mapped[0], away: away ?? mapped[1] };
  }

  return { home, away };
}

function normalizeH2HRow(item: ApiFixtureDetailItem): PlMatchH2HRow {
  const status = mapFixtureStatus(item.fixture.status.short);
  const finished = status === "FT";

  return {
    fixtureId: item.fixture.id,
    kickoffUtc: new Date(item.fixture.date).toISOString(),
    homeTeamName: item.teams.home.name,
    awayTeamName: item.teams.away.name,
    homeScore: finished ? item.goals.home : null,
    awayScore: finished ? item.goals.away : null,
    status,
  };
}

function buildStandingsSnapshot(
  standings: PlStandingRow[],
  homeTeamId: number,
  awayTeamId: number,
): PlStandingRow[] {
  const display = resolveDisplayStandings(standings);
  if (!display.length) return [];

  const included = new Map<number, PlStandingRow>();
  for (const row of display.slice(0, 6)) {
    included.set(row.teamId, row);
  }
  for (const teamId of [homeTeamId, awayTeamId]) {
    if (!included.has(teamId)) {
      const row = display.find((entry) => entry.teamId === teamId);
      if (row) included.set(teamId, row);
    }
  }

  return [...included.values()].sort((a, b) => a.rank - b.rank);
}

function emptyMatchResponse(
  fixtureId: number,
  error?: string,
): PlMatchApiResponse {
  const base = plBaseEnvelope("fallback", {
    fixtureId,
    fixture: null,
    apiAvailable: false,
    events: [] as MatchEventItem[],
    lineups: { home: null, away: null },
    statistics: [] as MatchStatisticPair[],
    h2h: [] as PlMatchH2HRow[],
    standingsSnapshot: [] as PlStandingRow[],
  });

  return {
    ...base,
    error,
  };
}

export async function fetchPlMatchDetail(
  fixtureId: number,
  locale = "en-GB",
): Promise<PlMatchApiResponse> {
  if (!Number.isFinite(fixtureId) || fixtureId <= 0) {
    return emptyMatchResponse(fixtureId, "Invalid fixture id.");
  }

  if (!isPlApiConfigured()) {
    return emptyMatchResponse(fixtureId);
  }

  try {
    const fixtureResult = await apiFootballFetch<ApiFixtureDetailItem[]>(
      `/fixtures?id=${fixtureId}`,
    );

    if (!fixtureResult.ok) {
      if (fixtureResult.kind === "unconfigured") {
        return emptyMatchResponse(fixtureId);
      }
      return {
        ...emptyMatchResponse(fixtureId, fixtureResult.message),
        configured: true,
      };
    }

    const raw = fixtureResult.data[0];
    if (!raw) {
      return {
        ...emptyMatchResponse(fixtureId, "Fixture not found."),
        configured: true,
      };
    }

    if (
      raw.league.id !== PL_LEAGUE_ID ||
      raw.league.season !== PL_SEASON
    ) {
      return {
        ...emptyMatchResponse(fixtureId, "Fixture is not a Premier League 2026/27 match."),
        configured: true,
      };
    }

    const fixture = normalizeFixtureRow(raw, locale);
    const { homeTeamId, awayTeamId, homeTeamName, awayTeamName } = fixture;

    const [eventsResult, lineupsResult, statsResult, h2hResult, standingsBody] =
      await Promise.all([
        apiFootballFetch<ApiEventRow[]>(`/fixtures/events?fixture=${fixtureId}`),
        apiFootballFetch<ApiLineupRow[]>(`/fixtures/lineups?fixture=${fixtureId}`),
        apiFootballFetch<ApiStatRow[]>(`/fixtures/statistics?fixture=${fixtureId}`),
        apiFootballFetch<ApiFixtureDetailItem[]>(
          `/fixtures/headtohead?h2h=${homeTeamId}-${awayTeamId}&last=5`,
        ),
        fetchPlStandings(),
      ]);

    const events =
      eventsResult.ok ? mapEvents(eventsResult.data) : [];
    const lineups = lineupsResult.ok
      ? resolveLineupSides(lineupsResult.data, homeTeamId, awayTeamId)
      : { home: null, away: null };
    const statistics = statsResult.ok
      ? mapStatistics(statsResult.data, homeTeamName, awayTeamName)
      : [];
    const h2h = h2hResult.ok
      ? h2hResult.data.map(normalizeH2HRow)
      : [];
    const standingsSnapshot = buildStandingsSnapshot(
      standingsBody.standings,
      homeTeamId,
      awayTeamId,
    );

    const apiAvailable =
      fixtureResult.ok &&
      (eventsResult.ok ||
        lineupsResult.ok ||
        statsResult.ok ||
        h2hResult.ok);

    return plBaseEnvelope("api-football", {
      configured: true,
      fixtureId,
      fixture,
      apiAvailable,
      events,
      lineups,
      statistics,
      h2h,
      standingsSnapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      ...emptyMatchResponse(fixtureId, message),
      configured: true,
    };
  }
}

export function plMatchCacheControl(body: PlMatchApiResponse): string {
  if (!body.configured) return "no-store";
  if (body.stale) return "no-store";
  if (body.fixture?.status === "LIVE") {
    return "s-maxage=30, stale-while-revalidate=15";
  }
  if (body.fixture?.status === "UPCOMING") {
    return "s-maxage=300, stale-while-revalidate=60";
  }
  return "s-maxage=3600, stale-while-revalidate=300";
}

/**
 * Cached PL match detail with singleflight de-dupe and stale-on-failure.
 * Mirrors WC26/FA Cup house style (setSuccessApiCache / getStaleApiCache).
 */
export async function getCachedPlMatchDetail(
  fixtureId: number,
  locale = "en-GB",
): Promise<PlMatchApiResponse> {
  if (!Number.isFinite(fixtureId) || fixtureId <= 0) {
    return emptyMatchResponse(fixtureId, "Invalid fixture id.");
  }

  const key = plMatchDetailCacheKey(fixtureId);
  const fresh = getCached(key);
  if (fresh) {
    return fresh as PlMatchApiResponse;
  }

  const pending = plMatchDetailInflight.get(key);
  if (pending) {
    return pending;
  }

  const run = (async () => {
    try {
      const body = await fetchPlMatchDetail(fixtureId, locale);
      if (body.fixture) {
        setSuccessApiCache(key, body, plMatchDetailFreshTtlMs(body));
        return body;
      }

      const stale = getStaleApiCache<PlMatchApiResponse>(key);
      if (stale?.fixture) {
        return {
          ...stale,
          stale: true,
          error: body.error ?? stale.error,
          fetchedAt: new Date().toISOString(),
        };
      }

      return body;
    } finally {
      plMatchDetailInflight.delete(key);
    }
  })();

  plMatchDetailInflight.set(key, run);
  return run;
}

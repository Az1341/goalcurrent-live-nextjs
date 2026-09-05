import { getFixtureById, getTeamById, WC26_FIXTURES } from "@/data/wc26";
import {
  resolveApiFixtureIdForLocal,
  kickoffDateRange,
  classifyKnownWc26ApiFixtureId,
  isWc26ApiFixtureOwnershipBound,
  WC26_API_LEAGUE_ID,
  WC26_API_SEASON,
  type ApiFixtureLookupRow,
  type ApiFixtureOwnershipRow,
} from "@/lib/server/wc26-api-fixture-id";
import { getRegisteredWc26ApiFixtureId } from "@/lib/server/wc26-api-fixture-registry";
import { getCached, setCached } from "@/lib/server/cache";
import { resolveFixtureParticipant } from "@/lib/wc26-live";
import type { EffectiveFixture } from "@/lib/wc26-fixture-overlay";
import { resolveTeamId } from "@/lib/teamIdentity";
import type {
  MatchDetailPayload,
  MatchEventItem,
  MatchLineupPlayer,
  MatchLineupSide,
  MatchPlayerApiStat,
  MatchStatisticPair,
} from "@/types/match-detail";
import { isWc26ApiConfigured } from "@/lib/server/wc26-api-football";

import { MATCH_STAT_LABELS } from "@/lib/wc26-match";

const WC_LEAGUE = WC26_API_LEAGUE_ID;
const WC_SEASON = WC26_API_SEASON;

const STAT_KEYS = [
  "ball_possession",
  "total_shots",
  "shots_on_goal",
  "corner_kicks",
  "fouls",
  "yellow_cards",
  "red_cards",
] as const;

async function apiFetchResponse<T>(_path: string): Promise<T[]> {
  return [];
}

type ApiFixtureRow = ApiFixtureLookupRow;

type ApiEventRow = {
  time: { elapsed: number | null; extra: number | null };
  team: { name: string };
  player: { name: string };
  assist: { name: string | null } | null;
  type: string;
  detail: string;
};

type ApiLineupPlayerEntry = {
  player: {
    id?: number;
    name: string;
    number: number | null;
    pos: string | null;
    grid?: string | null;
    photo?: string | null;
  };
};

type ApiLineupRow = {
  team: { name: string };
  coach: { name: string | null } | null;
  formation: string | null;
  startXI: ApiLineupPlayerEntry[];
  substitutes: ApiLineupPlayerEntry[];
};

type ApiFixturePlayerRow = {
  team: { name: string };
  players: Array<{
    player: { id: number; name: string; photo: string | null };
    statistics: Array<{
      games?: {
        minutes?: number | null;
        number?: number | null;
        position?: string | null;
        rating?: string | number | null;
        captain?: boolean;
        substitute?: boolean;
      };
      shots?: { total?: number | null; on?: number | null };
      goals?: { total?: number | null; assists?: number | null };
      passes?: { accuracy?: string | number | null };
      fouls?: { committed?: number | null };
      cards?: { yellow?: number | null; red?: number | null };
    }>;
  }>;
};

type ApiStatRow = {
  team: { name: string };
  statistics: Array<{ type: string; value: string | number | null }>;
};

function emptyPayload(fixtureId: string): MatchDetailPayload {
  return {
    fixtureId,
    configured: isWc26ApiConfigured(),
    apiAvailable: false,
    fetchedAt: new Date().toISOString(),
    events: [],
    lineups: { home: null, away: null },
    statistics: [],
    playerStats: [],
  };
}

function parseApiNumber(value: string | number | null | undefined): number | null {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  const parsed = Number.parseFloat(String(value).replace("%", "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPassAccuracy(value: string | number | null | undefined): string | null {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value === "string" && value.includes("%")) {
    return value;
  }
  const parsed = parseApiNumber(value);
  return parsed == null ? null : `${Math.round(parsed)}%`;
}

function mapPlayerStatistics(rows: ApiFixturePlayerRow[]): MatchPlayerApiStat[] {
  const stats: MatchPlayerApiStat[] = [];

  for (const row of rows) {
    for (const entry of row.players ?? []) {
      const block = entry.statistics?.[0];
      if (!block) {
        continue;
      }

      const games = block.games;
      const minutes = parseApiNumber(games?.minutes);
      if ((minutes ?? 0) <= 0 && !games?.substitute) {
        continue;
      }

      stats.push({
        playerName: entry.player.name,
        teamName: row.team.name,
        number: games?.number ?? null,
        position: games?.position ?? null,
        minutes,
        goals: parseApiNumber(block.goals?.total),
        assists: parseApiNumber(block.goals?.assists),
        shots: parseApiNumber(block.shots?.total),
        shotsOnTarget: parseApiNumber(block.shots?.on),
        passAccuracy: formatPassAccuracy(block.passes?.accuracy),
        fouls: parseApiNumber(block.fouls?.committed),
        yellowCards: parseApiNumber(block.cards?.yellow),
        redCards: parseApiNumber(block.cards?.red),
        substituted: Boolean(games?.substitute),
        rating: parseApiNumber(games?.rating),
      });
    }
  }

  return stats;
}

async function verifyKnownWc26ApiFixtureOwnership(
  fixtureId: string,
  apiFixtureId: number,
): Promise<boolean> {
  try {
    const rows = await apiFetchResponse<ApiFixtureOwnershipRow>(
      `/fixtures?id=${apiFixtureId}`,
    );
    const row = rows.find((entry) => entry.fixture?.id === apiFixtureId) ?? rows[0];
    if (!row) {
      return false;
    }
    return isWc26ApiFixtureOwnershipBound(fixtureId, row);
  } catch {
    return false;
  }
}

/**
 * BE-004 — resolve a query/registry apiFixtureId only when ownership is trusted.
 * Rejects registry mismatches; verifies unregistered ids against WC league/season
 * and local fixture identity before upstream events/lineups/stats fan-out.
 */
export async function resolveTrustedWc26ApiFixtureId(
  fixtureId: string,
  knownApiFixtureId?: number | null,
): Promise<
  | { ok: true; apiFixtureId?: number }
  | { ok: false; code: "api_fixture_mismatch"; message: string }
> {
  const registered = getRegisteredWc26ApiFixtureId(fixtureId);
  const trust = classifyKnownWc26ApiFixtureId(knownApiFixtureId, registered);

  if (trust.action === "reject") {
    return {
      ok: false,
      code: "api_fixture_mismatch",
      message: "apiFixtureId does not match the registered WC26 fixture binding.",
    };
  }

  if (trust.action === "use") {
    return { ok: true, apiFixtureId: trust.apiFixtureId };
  }

  if (trust.action === "verify") {
    if (!isWc26ApiConfigured()) {
      // Cannot bind without provider metadata — ignore untrusted override.
      return { ok: true, apiFixtureId: undefined };
    }
    const bound = await verifyKnownWc26ApiFixtureOwnership(
      fixtureId,
      trust.apiFixtureId,
    );
    if (!bound) {
      return {
        ok: false,
        code: "api_fixture_mismatch",
        message: "apiFixtureId is not bound to this WC26 fixture/league/season.",
      };
    }
    setCached(`wc26:api-fixture:${fixtureId}`, trust.apiFixtureId, 86_400_000);
    return { ok: true, apiFixtureId: trust.apiFixtureId };
  }

  return { ok: true, apiFixtureId: registered };
}

async function findApiFootballFixtureId(
  fixtureId: string,
  knownApiFixtureId?: number | null,
): Promise<number | null> {
  const trusted = await resolveTrustedWc26ApiFixtureId(
    fixtureId,
    knownApiFixtureId,
  );
  if (!trusted.ok) {
    return null;
  }
  if (trusted.apiFixtureId != null) {
    return trusted.apiFixtureId;
  }

  const cachedApiId = getCached(`wc26:api-fixture:${fixtureId}`);
  if (typeof cachedApiId === "number" && Number.isFinite(cachedApiId)) {
    return cachedApiId;
  }

  const registered = getRegisteredWc26ApiFixtureId(fixtureId);
  if (registered != null) {
    return registered;
  }

  const fixture = getFixtureById(fixtureId);
  if (!fixture) {
    return null;
  }

  try {
    const liveRows = await apiFetchResponse<ApiFixtureRow>(
      `/fixtures?league=${WC_LEAGUE}&season=${WC_SEASON}&live=all`,
    );
    const liveId = resolveApiFixtureIdForLocal(fixtureId, liveRows);
    if (liveId != null) {
      setCached(`wc26:api-fixture:${fixtureId}`, liveId, 86_400_000);
      return liveId;
    }
  } catch {
    // Fall through to date-based lookup.
  }

  const seenDates = new Set<string>();
  for (const date of kickoffDateRange(fixture.kickoffUtc)) {
    if (seenDates.has(date)) {
      continue;
    }
    seenDates.add(date);

    const rows = await apiFetchResponse<ApiFixtureRow>(
      `/fixtures?league=${WC_LEAGUE}&season=${WC_SEASON}&date=${date}`,
    );
    const resolved = resolveApiFixtureIdForLocal(fixtureId, rows);
    if (resolved != null) {
      setCached(`wc26:api-fixture:${fixtureId}`, resolved, 86_400_000);
      return resolved;
    }
  }

  return null;
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

function buildPlayerMetaMap(
  rows: ApiFixturePlayerRow[],
): Map<string, { photo: string | null; isCaptain: boolean; rating: number | null }> {
  const map = new Map<string, { photo: string | null; isCaptain: boolean; rating: number | null }>();

  for (const row of rows) {
    for (const entry of row.players ?? []) {
      const stats = entry.statistics?.[0]?.games;
      const ratingRaw = stats?.rating;
      const rating =
        ratingRaw == null
          ? null
          : typeof ratingRaw === "number"
            ? ratingRaw
            : Number.parseFloat(String(ratingRaw));

      map.set(entry.player.name.toLowerCase(), {
        photo: entry.player.photo,
        isCaptain: Boolean(stats?.captain),
        rating: Number.isFinite(rating) ? rating : null,
      });
    }
  }

  return map;
}

function mapPlayers(
  players: ApiLineupPlayerEntry[],
  meta: Map<string, { photo: string | null; isCaptain: boolean; rating: number | null }>,
): MatchLineupPlayer[] {
  return players.map((entry) => {
    const metaRow = meta.get(entry.player.name.toLowerCase());
    return {
      name: entry.player.name,
      number: entry.player.number,
      position: entry.player.pos,
      photo: entry.player.photo ?? metaRow?.photo ?? null,
      is_captain: metaRow?.isCaptain ?? false,
      rating: metaRow?.rating ?? null,
      grid_position: entry.player.grid ?? null,
    };
  });
}

function mapLineupSide(
  row: ApiLineupRow,
  meta: Map<string, { photo: string | null; isCaptain: boolean; rating: number | null }>,
): MatchLineupSide {
  return {
    teamName: row.team.name,
    formation: row.formation,
    coach: row.coach?.name ?? null,
    startXI: mapPlayers(row.startXI ?? [], meta),
    substitutes: mapPlayers(row.substitutes ?? [], meta),
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

  function findStats(officialName: string): Record<string, string | number | null> {
    // 1. Exact match
    if (byTeam.has(officialName)) return byTeam.get(officialName)!;
    // 2. Resolve via teamIdentity aliases (e.g. "Iran" -> "irn" -> "IR Iran")
    const ourId = resolveTeamId(officialName);
    if (ourId) {
      for (const [apiName, data] of byTeam.entries()) {
        const apiId = resolveTeamId(apiName);
        if (apiId === ourId) return data;
      }
    }
    // 3. Strip punctuation and partial match
    const lower = officialName.toLowerCase().replace(/[^a-z]/g, "");
    for (const [apiName, data] of byTeam.entries()) {
      const apiLower = apiName.toLowerCase().replace(/[^a-z]/g, "");
      if (apiLower.includes(lower) || lower.includes(apiLower)) return data;
    }
    return {};
  }

  // Positional fallback: if 2 rows returned and name resolution fails, assign by position
  const entries = Array.from(byTeam.entries());
  let homeStats = findStats(homeTeamName);
  let awayStats = findStats(awayTeamName);

  if (entries.length === 2 && (Object.keys(homeStats).length === 0 || Object.keys(awayStats).length === 0)) {
    const homeId = resolveTeamId(homeTeamName);
    const firstId = resolveTeamId(entries[0]![0]);
    if (firstId === homeId) {
      homeStats = entries[0]![1];
      awayStats = entries[1]![1];
    } else {
      homeStats = entries[1]![1];
      awayStats = entries[0]![1];
    }
  }

  return STAT_KEYS.filter((key) => homeStats[key] != null || awayStats[key] != null).map(
    (key) => ({
      key,
      label: MATCH_STAT_LABELS[key] ?? key,
      home: homeStats[key] ?? null,
      away: awayStats[key] ?? null,
    }),
  );
}

function resolveLineupSides(
  rows: ApiLineupRow[],
  fixtureId: string,
  meta: Map<string, { photo: string | null; isCaptain: boolean; rating: number | null }>,
): { home: MatchLineupSide | null; away: MatchLineupSide | null } {
  const fixture = getFixtureById(fixtureId);
  if (!fixture) {
    return { home: null, away: null };
  }

  const resolvedHome = resolveFixtureParticipant(
    fixture as EffectiveFixture,
    "home",
    WC26_FIXTURES,
  );
  const resolvedAway = resolveFixtureParticipant(
    fixture as EffectiveFixture,
    "away",
    WC26_FIXTURES,
  );

  let home: MatchLineupSide | null = null;
  let away: MatchLineupSide | null = null;

  for (const row of rows) {
    const side = mapLineupSide(row, meta);
    const teamId = resolveTeamId(row.team.name);
    if (teamId === resolvedHome.teamId || teamId === fixture.homeTeamId) {
      home = side;
    } else if (teamId === resolvedAway.teamId || teamId === fixture.awayTeamId) {
      away = side;
    }
  }

  if (rows.length === 2 && (!home || !away)) {
    const mapped = rows.map((row) => mapLineupSide(row, meta));
    return { home: home ?? mapped[0], away: away ?? mapped[1] };
  }

  return { home, away };
}

export async function fetchWc26EventsForApiFixture(
  apiFixtureId: number,
): Promise<{ events: MatchEventItem[]; apiAvailable: boolean }> {
  if (!isWc26ApiConfigured()) {
    return { events: [], apiAvailable: false };
  }

  try {
    const rows = await apiFetchResponse<ApiEventRow>(
      `/fixtures/events?fixture=${apiFixtureId}`,
    );
    return { events: mapEvents(rows), apiAvailable: true };
  } catch {
    return { events: [], apiAvailable: false };
  }
}

export async function fetchWc26MatchEvents(
  fixtureId: string,
  knownApiFixtureId?: number | null,
): Promise<{ events: MatchEventItem[]; apiAvailable: boolean }> {
  if (!getFixtureById(fixtureId) || !isWc26ApiConfigured()) {
    return { events: [], apiAvailable: false };
  }

  try {
    const apiFixtureId = await findApiFootballFixtureId(
      fixtureId,
      knownApiFixtureId,
    );
    if (!apiFixtureId) {
      return { events: [], apiAvailable: false };
    }

    const rows = await apiFetchResponse<ApiEventRow>(
      `/fixtures/events?fixture=${apiFixtureId}`,
    );

    return { events: mapEvents(rows), apiAvailable: true };
  } catch {
    return { events: [], apiAvailable: false };
  }
}

export async function fetchWc26MatchDetail(
  fixtureId: string,
  knownApiFixtureId?: number | null,
): Promise<MatchDetailPayload> {
  if (!getFixtureById(fixtureId)) {
    return emptyPayload(fixtureId);
  }

  if (!isWc26ApiConfigured()) {
    return emptyPayload(fixtureId);
  }

  try {
    const apiFixtureId = await findApiFootballFixtureId(
      fixtureId,
      knownApiFixtureId,
    );
    if (!apiFixtureId) {
      return emptyPayload(fixtureId);
    }

    const [events, lineups, statistics, players] = await Promise.all([
      apiFetchResponse<ApiEventRow>(`/fixtures/events?fixture=${apiFixtureId}`),
      apiFetchResponse<ApiLineupRow>(`/fixtures/lineups?fixture=${apiFixtureId}`),
      apiFetchResponse<ApiStatRow>(`/fixtures/statistics?fixture=${apiFixtureId}`),
      apiFetchResponse<ApiFixturePlayerRow>(`/fixtures/players?fixture=${apiFixtureId}`),
    ]);

    const playerMeta = buildPlayerMetaMap(players);
    const fixture = getFixtureById(fixtureId)!;
    const homeResolved = resolveFixtureParticipant(
      fixture as EffectiveFixture,
      "home",
      WC26_FIXTURES,
    );
    const awayResolved = resolveFixtureParticipant(
      fixture as EffectiveFixture,
      "away",
      WC26_FIXTURES,
    );
    const homeTeam = getTeamById(homeResolved.teamId);
    const awayTeam = getTeamById(awayResolved.teamId);

    return {
      fixtureId,
      configured: true,
      apiAvailable: true,
      fetchedAt: new Date().toISOString(),
      events: mapEvents(events),
      lineups: resolveLineupSides(lineups, fixtureId, playerMeta),
      statistics: mapStatistics(
        statistics,
        homeTeam?.name ?? homeResolved.label,
        awayTeam?.name ?? awayResolved.label,
      ),
      playerStats: mapPlayerStatistics(players),
    };
  } catch (error) {
    throw error;
  }
}

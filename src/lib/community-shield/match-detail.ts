import { apiFootballFetch } from "@/lib/pl/api-core";
import {
  COMMUNITY_SHIELD_FIXTURE_ID,
  COMMUNITY_SHIELD_LEAGUE_ID,
  COMMUNITY_SHIELD_SEASON,
  isCommunityShieldFixtureId,
} from "@/lib/community-shield/constants";
import type {
  MatchEventItem,
  MatchLineupPlayer,
  MatchLineupSide,
  MatchStatisticPair,
} from "@/types/match-detail";

export type CommunityShieldRecentMeeting = {
  fixtureId: number;
  kickoffUtc: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
};

export type CommunityShieldMatchDetail = {
  fixtureId: number;
  configured: boolean;
  apiAvailable: boolean;
  status: "UPCOMING" | "LIVE" | "FT" | "POSTPONED" | "CANCELLED";
  statusShort: string;
  elapsed: number | null;
  referee: string | null;
  venue: string | null;
  homeScore: number | null;
  awayScore: number | null;
  events: MatchEventItem[];
  lineups: { home: MatchLineupSide | null; away: MatchLineupSide | null };
  statistics: MatchStatisticPair[];
  recentMeetings: CommunityShieldRecentMeeting[];
  fetchedAt: string;
  error?: string;
};

type ApiFixture = {
  fixture: {
    id: number;
    date: string;
    referee: string | null;
    status: { short: string; elapsed: number | null };
    venue?: { name?: string | null; city?: string | null } | null;
  };
  league: { id: number; season: number };
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  goals: { home: number | null; away: number | null };
};

type ApiEvent = {
  time: { elapsed: number | null; extra: number | null };
  team: { name: string };
  player: { name: string };
  assist?: { name: string | null } | null;
  type: string;
  detail: string;
};

type ApiLineup = {
  team: { id: number; name: string };
  coach?: { name: string | null } | null;
  formation: string | null;
  startXI?: Array<{ player: { name: string; number: number | null; pos: string | null } }>;
  substitutes?: Array<{ player: { name: string; number: number | null; pos: string | null } }>;
};

type ApiStats = {
  team: { name: string };
  statistics: Array<{ type: string; value: string | number | null }>;
};

const STAT_KEYS = [
  "Ball Possession",
  "Total Shots",
  "Shots on Goal",
  "Corner Kicks",
  "Fouls",
  "Yellow Cards",
  "Red Cards",
  "Goalkeeper Saves",
] as const;

function mapStatus(short: string): CommunityShieldMatchDetail["status"] {
  const code = short.trim().toUpperCase();
  if (["FT", "AET", "PEN"].includes(code)) return "FT";
  if (["1H", "2H", "HT", "ET", "BT", "P", "INT", "LIVE"].includes(code)) return "LIVE";
  if (code === "PST") return "POSTPONED";
  if (["CANC", "ABD", "AWD", "WO"].includes(code)) return "CANCELLED";
  return "UPCOMING";
}

function players(rows: ApiLineup["startXI"] | ApiLineup["substitutes"]): MatchLineupPlayer[] {
  return (rows ?? []).map(({ player }) => ({
    name: player.name,
    number: player.number,
    position: player.pos,
  }));
}

function lineup(row: ApiLineup): MatchLineupSide {
  return {
    teamName: row.team.name,
    formation: row.formation,
    coach: row.coach?.name ?? null,
    startXI: players(row.startXI),
    substitutes: players(row.substitutes),
  };
}

function mapStatistics(rows: ApiStats[], home: string, away: string): MatchStatisticPair[] {
  const byTeam = new Map(rows.map((row) => [row.team.name, row.statistics]));
  const pick = (team: string, label: string) =>
    byTeam.get(team)?.find((item) => item.type === label)?.value ?? null;

  return STAT_KEYS.map((label) => ({
    key: label.toLowerCase().replace(/\s+/g, "_"),
    label,
    home: pick(home, label),
    away: pick(away, label),
  })).filter((row) => row.home != null || row.away != null);
}

function mapRecentMeeting(row: ApiFixture): CommunityShieldRecentMeeting {
  const finished = mapStatus(row.fixture.status.short) === "FT";
  return {
    fixtureId: row.fixture.id,
    kickoffUtc: new Date(row.fixture.date).toISOString(),
    homeTeamName: row.teams.home.name,
    awayTeamName: row.teams.away.name,
    homeScore: finished ? row.goals.home : null,
    awayScore: finished ? row.goals.away : null,
  };
}

function empty(error?: string): CommunityShieldMatchDetail {
  return {
    fixtureId: COMMUNITY_SHIELD_FIXTURE_ID,
    configured: false,
    apiAvailable: false,
    status: "UPCOMING",
    statusShort: "NS",
    elapsed: null,
    referee: null,
    venue: null,
    homeScore: null,
    awayScore: null,
    events: [],
    lineups: { home: null, away: null },
    statistics: [],
    recentMeetings: [],
    fetchedAt: new Date().toISOString(),
    error,
  };
}

export async function fetchCommunityShieldMatchDetail(
  fixtureId = COMMUNITY_SHIELD_FIXTURE_ID,
): Promise<CommunityShieldMatchDetail> {
  if (!isCommunityShieldFixtureId(fixtureId)) return empty("Invalid Community Shield fixture id.");

  const fixtureResult = await apiFootballFetch<ApiFixture[]>(`/fixtures?id=${fixtureId}`);
  if (!fixtureResult.ok) {
    return {
      ...empty(fixtureResult.kind === "unconfigured" ? undefined : fixtureResult.message),
      configured: fixtureResult.kind !== "unconfigured",
    };
  }

  const raw = fixtureResult.data[0];
  if (!raw || raw.league.id !== COMMUNITY_SHIELD_LEAGUE_ID || raw.league.season !== COMMUNITY_SHIELD_SEASON) {
    return { ...empty("Fixture identity check failed."), configured: true };
  }

  const homeId = raw.teams.home.id;
  const awayId = raw.teams.away.id;

  const [eventsResult, lineupsResult, statsResult, h2hResult] = await Promise.all([
    apiFootballFetch<ApiEvent[]>(`/fixtures/events?fixture=${fixtureId}`),
    apiFootballFetch<ApiLineup[]>(`/fixtures/lineups?fixture=${fixtureId}`),
    apiFootballFetch<ApiStats[]>(`/fixtures/statistics?fixture=${fixtureId}`),
    apiFootballFetch<ApiFixture[]>(`/fixtures/headtohead?h2h=${homeId}-${awayId}&last=5`),
  ]);

  const lineupRows = lineupsResult.ok ? lineupsResult.data : [];
  const homeLineup = lineupRows.find((row) => row.team.id === homeId);
  const awayLineup = lineupRows.find((row) => row.team.id === awayId);
  const status = mapStatus(raw.fixture.status.short);
  const hasScore = status === "LIVE" || status === "FT";
  const venueParts = [raw.fixture.venue?.name, raw.fixture.venue?.city].filter(Boolean);

  return {
    fixtureId,
    configured: true,
    apiAvailable: eventsResult.ok || lineupsResult.ok || statsResult.ok || h2hResult.ok,
    status,
    statusShort: raw.fixture.status.short,
    elapsed: raw.fixture.status.elapsed,
    referee: raw.fixture.referee,
    venue: venueParts.length ? venueParts.join(", ") : null,
    homeScore: hasScore ? raw.goals.home : null,
    awayScore: hasScore ? raw.goals.away : null,
    events: eventsResult.ok
      ? eventsResult.data.map((event) => ({
          minute: event.time.elapsed,
          extra: event.time.extra,
          teamName: event.team.name,
          playerName: event.player.name,
          assistName: event.assist?.name ?? null,
          type: event.type,
          detail: event.detail,
        }))
      : [],
    lineups: {
      home: homeLineup ? lineup(homeLineup) : null,
      away: awayLineup ? lineup(awayLineup) : null,
    },
    statistics: statsResult.ok
      ? mapStatistics(statsResult.data, raw.teams.home.name, raw.teams.away.name)
      : [],
    recentMeetings: h2hResult.ok
      ? h2hResult.data
          .filter((meeting) => meeting.fixture.id !== fixtureId)
          .map(mapRecentMeeting)
      : [],
    fetchedAt: new Date().toISOString(),
  };
}

export function communityShieldMatchCacheControl(body: CommunityShieldMatchDetail): string {
  if (!body.configured) return "no-store";
  if (body.status === "LIVE") return "s-maxage=20, stale-while-revalidate=10";
  if (body.status === "UPCOMING") return "s-maxage=300, stale-while-revalidate=60";
  return "s-maxage=3600, stale-while-revalidate=300";
}

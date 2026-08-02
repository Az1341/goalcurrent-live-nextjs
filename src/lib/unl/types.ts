import {
  UNL_DISPLAY_NAME,
  UNL_LEAGUE_ID,
  UNL_SEASON,
  type UnlGroupId,
  type UnlLeagueId,
} from "@/lib/unl/constants";
import type { ApiFootballErrorCode } from "@/lib/api-football/errors";

export type UnlDataSource = "api-football" | "fallback";

export type UnlFixtureStatus =
  | "UPCOMING"
  | "LIVE"
  | "FT"
  | "AET"
  | "PEN"
  | "POSTPONED"
  | "CANCELLED";

export type UnlTeam = {
  teamId: number;
  name: string;
  flagCode: string;
  logo: string | null;
};

export type UnlGroup = {
  groupId: UnlGroupId;
  league: UnlLeagueId;
  label: string;
  teams: UnlTeam[];
};

export type UnlFixtureRow = {
  fixtureId: number;
  kickoffUtc: string;
  kickoffCet?: string;
  matchday: number;
  groupId: UnlGroupId;
  league: UnlLeagueId;
  round: string | null;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamFlag: string | null;
  homeTeamLogo: string | null;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamFlag: string | null;
  awayTeamLogo: string | null;
  status: UnlFixtureStatus;
  statusShort: string;
  elapsed: number | null;
  homeScore: number | null;
  awayScore: number | null;
};

export type UnlFixturesApiResponse = {
  configured: boolean;
  competitionKey: "unl";
  league: typeof UNL_DISPLAY_NAME;
  leagueId: typeof UNL_LEAGUE_ID;
  season: typeof UNL_SEASON;
  fixtures: UnlFixtureRow[];
  source: UnlDataSource;
  fetchedAt: string;
  error?: string;
  errorCode?: ApiFootballErrorCode;
  stale?: boolean;
};

export type UnlStandingRow = {
  rank: number;
  teamId: number;
  teamName: string;
  teamLogo: string | null;
  teamFlag: string | null;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: string | null;
  description: string | null;
  groupId: UnlGroupId;
  league: UnlLeagueId;
  group: string | null;
};

export type UnlStandingsApiResponse = {
  configured: boolean;
  competitionKey: "unl";
  league: typeof UNL_DISPLAY_NAME;
  leagueId: typeof UNL_LEAGUE_ID;
  season: typeof UNL_SEASON;
  standings: UnlStandingRow[];
  standingsAvailable: boolean;
  groupId?: UnlGroupId | null;
  source: UnlDataSource;
  fetchedAt: string;
  error?: string;
  errorCode?: ApiFootballErrorCode;
  stale?: boolean;
};
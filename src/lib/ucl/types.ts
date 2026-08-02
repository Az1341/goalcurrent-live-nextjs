import {
  UCL_DISPLAY_NAME,
  UCL_LEAGUE_ID,
  UCL_SEASON,
} from "@/lib/ucl/constants";
import type { ApiFootballErrorCode } from "@/lib/api-football/errors";

export type UclDataSource = "api-football" | "fallback";

export type UclFixtureStatus =
  | "UPCOMING"
  | "LIVE"
  | "FT"
  | "AET"
  | "PEN"
  | "POSTPONED"
  | "CANCELLED";

export type UclStageKind =
  | "league_phase"
  | "qualification"
  | "playoff"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "final"
  | "other";

export type UclFixtureRow = {
  fixtureId: number;
  kickoffUtc: string;
  round: string | null;
  stage: UclStageKind;
  venue: string | null;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamLogo: string | null;
  status: UclFixtureStatus;
  statusShort: string;
  elapsed: number | null;
  homeScore: number | null;
  awayScore: number | null;
  /** Aggregate across two legs when provider exposes both; otherwise null. */
  aggregateHome: number | null;
  aggregateAway: number | null;
  penaltyHome: number | null;
  penaltyAway: number | null;
};

export type UclFixturesApiResponse = {
  configured: boolean;
  competitionKey: "ucl";
  league: typeof UCL_DISPLAY_NAME;
  leagueId: typeof UCL_LEAGUE_ID;
  season: typeof UCL_SEASON;
  fixtures: UclFixtureRow[];
  source: UclDataSource;
  fetchedAt: string;
  error?: string;
  errorCode?: ApiFootballErrorCode;
  stale?: boolean;
};

export type UclStandingRow = {
  rank: number;
  teamId: number;
  teamName: string;
  teamLogo: string | null;
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
  group: string | null;
};

export type UclStandingsApiResponse = {
  configured: boolean;
  competitionKey: "ucl";
  league: typeof UCL_DISPLAY_NAME;
  leagueId: typeof UCL_LEAGUE_ID;
  season: typeof UCL_SEASON;
  standings: UclStandingRow[];
  standingsAvailable: boolean;
  source: UclDataSource;
  fetchedAt: string;
  error?: string;
  errorCode?: ApiFootballErrorCode;
  stale?: boolean;
};
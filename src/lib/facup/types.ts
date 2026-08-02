import {
  FACUP_DISPLAY_NAME,
  FACUP_LEAGUE_ID,
  FACUP_SEASON,
} from "@/lib/facup/constants";
import type { ApiFootballErrorCode } from "@/lib/api-football/errors";

export type FacupDataSource = "api-football" | "fallback";

export type FacupFixtureStatus =
  | "UPCOMING"
  | "LIVE"
  | "FT"
  | "AET"
  | "PEN"
  | "POSTPONED"
  | "CANCELLED"
  | "ABANDONED";

export type FacupRoundKind =
  | "qualifying"
  | "first_round"
  | "second_round"
  | "third_round"
  | "fourth_round"
  | "fifth_round"
  | "quarter_final"
  | "semi_final"
  | "final"
  | "replay"
  | "other";

export type FacupFixtureRow = {
  fixtureId: number;
  kickoffUtc: string | null;
  round: string | null;
  roundKind: FacupRoundKind;
  roundLabel: string;
  venue: string | null;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamLogo: string | null;
  status: FacupFixtureStatus;
  statusShort: string;
  elapsed: number | null;
  homeScore: number | null;
  awayScore: number | null;
  penaltyHome: number | null;
  penaltyAway: number | null;
  isReplay: boolean;
};

export type FacupRoundGroup = {
  roundKind: FacupRoundKind;
  roundLabel: string;
  fixtures: FacupFixtureRow[];
};

export type FacupFixturesApiResponse = {
  configured: boolean;
  competitionKey: "facup";
  league: typeof FACUP_DISPLAY_NAME;
  leagueId: typeof FACUP_LEAGUE_ID;
  season: typeof FACUP_SEASON;
  fixtures: FacupFixtureRow[];
  standingsSupported: false;
  source: FacupDataSource;
  fetchedAt: string;
  error?: string;
  errorCode?: ApiFootballErrorCode;
  stale?: boolean;
};
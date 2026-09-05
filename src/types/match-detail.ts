/** Normalised match detail payload retained for WC26 archive UI compatibility. */

import type { ApiFootballErrorCode } from "@/lib/api-football/errors";

export type MatchEventItem = {
  readonly minute: number | null;
  readonly extra: number | null;
  readonly teamName: string;
  readonly playerName: string;
  readonly assistName: string | null;
  readonly type: string;
  readonly detail: string;
};

export type MatchLineupPlayer = {
  readonly name: string;
  readonly number: number | null;
  readonly position: string | null;
  readonly photo?: string | null;
  readonly is_captain?: boolean;
  readonly rating?: number | null;
  readonly grid_position?: string | null;
};

export type MatchLineupSide = {
  readonly teamName: string;
  readonly formation: string | null;
  readonly coach: string | null;
  readonly startXI: readonly MatchLineupPlayer[];
  readonly substitutes: readonly MatchLineupPlayer[];
};

export type MatchStatisticPair = {
  readonly key: string;
  readonly label: string;
  readonly home: string | number | null;
  readonly away: string | number | null;
};

/** Per-player match stats from API-Football `/fixtures/players`. */
export type MatchPlayerApiStat = {
  readonly playerName: string;
  readonly teamName: string;
  readonly number: number | null;
  readonly position: string | null;
  readonly minutes: number | null;
  readonly goals: number | null;
  readonly assists: number | null;
  readonly shots: number | null;
  readonly shotsOnTarget: number | null;
  readonly passAccuracy: string | null;
  readonly fouls: number | null;
  readonly yellowCards: number | null;
  readonly redCards: number | null;
  readonly substituted: boolean;
  readonly rating: number | null;
};

export type MatchDetailPayload = {
  readonly fixtureId: string;
  readonly configured: boolean;
  readonly apiAvailable: boolean;
  readonly fetchedAt: string;
  readonly events: readonly MatchEventItem[];
  readonly lineups: {
    readonly home: MatchLineupSide | null;
    readonly away: MatchLineupSide | null;
  };
  readonly statistics: readonly MatchStatisticPair[];
  readonly playerStats: readonly MatchPlayerApiStat[];
  readonly error?: ApiFootballErrorCode;
  readonly message?: string;
  readonly stale?: boolean;
};

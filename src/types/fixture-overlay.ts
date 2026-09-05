import type { TeamId } from "@/types/team";

/** Runtime overlay entry for a WC26 fixture — never stored in SSOT data files. */
export type FixtureOverlayEntry = {
  readonly status: string;
  readonly homeScore?: number;
  readonly awayScore?: number;
  readonly elapsed?: number | null;
  /** Legacy provider fixture id retained only when old archive rows contain it. */
  readonly apiFixtureId?: number;
  /** Actual home/away from API — overrides knockout bracket labels when set. */
  readonly homeTeamId?: TeamId;
  readonly awayTeamId?: TeamId;
  /** API kickoff when it differs from the static FIFA schedule slot. */
  readonly kickoffUtc?: string;
  /** Penalty shootout score (when match decided on pens). */
  readonly penaltiesHome?: number;
  readonly penaltiesAway?: number;
};

/** Normalised match payload returned by /api/wc26/scores (fixture id resolved server-side). */
export type Wc26ApiMatch = {
  readonly fixtureId: string;
  readonly matchNumber: number;
  readonly status: string;
  readonly statusShort: string;
  readonly elapsed: number | null;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly kickoffUtc: string;
  /** Legacy provider fixture id retained only when old archive rows contain it. */
  readonly apiFixtureId?: number;
  readonly homeTeamId?: TeamId;
  readonly awayTeamId?: TeamId;
  readonly penaltiesHome?: number;
  readonly penaltiesAway?: number;
};

import type { ApiFootballErrorCode } from "@/lib/api-football/errors";

export type Wc26ScoresApiResponse = {
  readonly matches: readonly Wc26ApiMatch[];
  readonly fetchedAt: string;
  readonly configured: boolean;
  readonly phase?: string;
  readonly error?: ApiFootballErrorCode;
  readonly message?: string;
  readonly stale?: boolean;
};

/** Legacy live fixture row shape retained for archive UI compatibility. */
export type Wc26LiveFixturePayload = {
  readonly fixtureId: string;
  readonly homeTeamId: string;
  readonly awayTeamId: string;
  readonly home: { readonly name: string; readonly goals: number };
  readonly away: { readonly name: string; readonly goals: number };
  readonly fixture: {
    readonly status: { readonly elapsed: number | null };
  };
};

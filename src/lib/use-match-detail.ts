"use client";

import { useCallback, useMemo } from "react";
import type { MatchDetailPayload } from "@/types/match-detail";

function emptyDetail(fixtureId: string): MatchDetailPayload {
  return {
    fixtureId,
    configured: false,
    apiAvailable: false,
    fetchedAt: new Date().toISOString(),
    events: [],
    lineups: { home: null, away: null },
    statistics: [],
    playerStats: [],
  };
}

/** WC26 is an archive now; match detail never polls or fetches live provider data. */
export function matchDetailRefreshIntervalMs(): number {
  return 0;
}

export function useMatchDetail(
  fixtureId: string,
  _poll = false,
): {
  detail: MatchDetailPayload;
  loading: boolean;
  refresh: () => void;
} {
  const detail = useMemo(() => emptyDetail(fixtureId), [fixtureId]);
  const refresh = useCallback(() => {}, []);

  return { detail, loading: false, refresh };
}

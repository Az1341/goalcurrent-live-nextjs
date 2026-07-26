"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LIVE_API_PATHS, useLiveApi } from "@/lib/client/live-data";
import { useLiveScores } from "@/lib/client/useLiveScores";
import { LIVE_POLL_MATCH_MS } from "@/lib/client/fetcher";
import { WC26_FIXTURES_UPDATED_EVENT } from "@/lib/wc26-fixture-overlay";
import { useEffectiveFixtures } from "@/lib/use-effective-fixtures";
import { isCompletedMatchStatus } from "@/lib/wc26-tournament-stats";
import type { MatchDetailPayload } from "@/types/match-detail";

const POLL_MS = LIVE_POLL_MATCH_MS;
const API_FIXTURE_ID_STORAGE_KEY = "wc26:api-fixture-ids";

/**
 * FE-015 — finished matches must not keep a 15s match-detail poller.
 * Returns 0 when polling is disabled or the match status is completed.
 */
export function matchDetailRefreshIntervalMs(
  pollRequested: boolean,
  status: string | null | undefined,
): number {
  if (!pollRequested) {
    return 0;
  }
  if (status != null && String(status).trim() !== "" && isCompletedMatchStatus(status)) {
    return 0;
  }
  return POLL_MS;
}

function readStoredApiFixtureId(fixtureId: string): number | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  try {
    const raw = sessionStorage.getItem(API_FIXTURE_ID_STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    const map = JSON.parse(raw) as Record<string, number>;
    const value = map[fixtureId];
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

function storeApiFixtureId(fixtureId: string, apiFixtureId: number): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const raw = sessionStorage.getItem(API_FIXTURE_ID_STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    map[fixtureId] = apiFixtureId;
    sessionStorage.setItem(API_FIXTURE_ID_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage failures.
  }
}

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

export function useMatchDetail(
  fixtureId: string,
  poll = true,
): {
  detail: MatchDetailPayload;
  loading: boolean;
  refresh: () => void;
} {
  const fixtures = useEffectiveFixtures();
  const { data: liveScores } = useLiveScores();

  const [storedApiFixtureId] = useState<number | undefined>(() =>
    readStoredApiFixtureId(fixtureId),
  );

  const fixture = fixtures.find((entry) => entry.id === fixtureId);
  const liveMatches = Array.isArray(liveScores?.matches)
    ? liveScores.matches
    : [];
  const liveMatch = liveMatches.find((match) => match.fixtureId === fixtureId);
  const apiFixtureId =
    fixture?.apiFixtureId ??
    liveMatch?.apiFixtureId ??
    storedApiFixtureId;
  // Prefer live feed status so FT stops polling even when SSOT fixture remains scheduled.
  const matchStatus = liveMatch?.status ?? fixture?.status;
  const refreshInterval = matchDetailRefreshIntervalMs(
    poll,
    matchStatus,
  );
  const activePoll = refreshInterval > 0;

  useEffect(() => {
    if (apiFixtureId == null) {
      return;
    }
    // Persist for remounts only — avoid setState-in-effect (live/fixture already win).
    storeApiFixtureId(fixtureId, apiFixtureId);
  }, [apiFixtureId, fixtureId]);

  const liveScoresReady = liveScores !== undefined;
  // Knockout pages resolve api-sports ids server-side — do not block on live scores.
  const fetchReady = true;

  const path = useMemo(() => {
    if (!fetchReady) {
      return null;
    }
    const base = LIVE_API_PATHS.wc26Match(fixtureId);
    if (apiFixtureId == null) {
      return base;
    }
    return `${base}?apiFixtureId=${apiFixtureId}`;
  }, [apiFixtureId, fetchReady, fixtureId]);

  const { data, isLoading, mutate } = useLiveApi<MatchDetailPayload>(path, {
    fresh: true,
    refreshInterval,
  });

  useEffect(() => {
    if (!path) {
      return;
    }
    void mutate();
  }, [mutate, path]);

  useEffect(() => {
    if (!activePoll) {
      return undefined;
    }

    const onOverlay = () => {
      void mutate();
    };

    window.addEventListener(WC26_FIXTURES_UPDATED_EVENT, onOverlay);
    return () => window.removeEventListener(WC26_FIXTURES_UPDATED_EVENT, onOverlay);
  }, [activePoll, mutate]);

  useEffect(() => {
    if (!activePoll || !liveScoresReady || apiFixtureId == null) {
      return;
    }
    void mutate();
  }, [activePoll, apiFixtureId, liveScoresReady, mutate]);

  // API error bodies (e.g. 503 JSON) can arrive without lineups/events —
  // normalise so match sections always receive a well-formed payload.
  const detail = useMemo<MatchDetailPayload>(() => {
    if (!data) {
      return emptyDetail(fixtureId);
    }
    if (Array.isArray(data.events) && data.lineups != null) {
      return data;
    }
    return {
      ...emptyDetail(fixtureId),
      ...data,
      events: data.events ?? [],
      lineups: data.lineups ?? { home: null, away: null },
      statistics: data.statistics ?? [],
      playerStats: data.playerStats ?? [],
    };
  }, [data, fixtureId]);
  const loading = isLoading && !data;

  const refresh = useCallback(() => {
    void mutate();
  }, [mutate]);

  return { detail, loading, refresh };
}

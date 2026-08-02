"use client";

import useSWR from "swr";
import {
  fetcher,
  LIVE_POLL_HUB_MS,
  LIVE_POLL_MATCH_MS,
  visibilityAwareRefreshInterval,
} from "@/lib/client/fetcher";

export const LIVE_API_PATHS = {
  wc26LiveScores: "/api/wc26/scores?live=true",
  wc26Results: "/api/wc26/scores?results=wc",
  wc26TopScorers: "/api/wc26/top-scorers",
  plFixtures: "/api/pl/fixtures",
  uclFixtures: "/api/ucl/fixtures",
  facupFixtures: "/api/facup/fixtures",
  unlFixtures: "/api/unl/fixtures",
  unlStandings: "/api/unl/standings",
  plTopScorers: "/api/pl/top-scorers",
  wc26Match: (fixtureId: string) =>
    `/api/wc26/match/${encodeURIComponent(fixtureId)}`,
} as const;

type UseLiveApiOptions = {
  /** Poll interval in ms; omit for hub default (75s). Pass 30_000 for live match pages. */
  refreshInterval?: number;
  /** Use LIVE_MATCH_FETCH_SWR_OPTIONS Ã¢â‚¬â€ no stale data flash on live/home match sections. */
  fresh?: boolean;
};

/** Build SWR options for useLiveApi Ã¢â‚¬â€ pure helper for hook-stable single useSWR call. */
export function buildUseLiveApiSwrOptions(options?: UseLiveApiOptions) {
  const fresh = Boolean(options?.fresh);
  const pollMs =
    options?.refreshInterval !== undefined
      ? options.refreshInterval
      : fresh
        ? LIVE_POLL_MATCH_MS
        : LIVE_POLL_HUB_MS;

  if (fresh) {
    return {
      revalidateOnMount: true as const,
      revalidateOnFocus: false as const,
      fallbackData: undefined,
      keepPreviousData: true as const,
      refreshInterval: () => visibilityAwareRefreshInterval(pollMs),
      dedupingInterval: pollMs,
      revalidateOnReconnect: true as const,
    };
  }

  return {
    refreshInterval: () => visibilityAwareRefreshInterval(pollMs),
    dedupingInterval: pollMs > 0 ? pollMs : LIVE_POLL_HUB_MS,
    revalidateOnFocus: false as const,
    revalidateOnReconnect: true as const,
  };
}

export function useLiveApi<T = unknown>(
  path: string | null,
  options?: UseLiveApiOptions,
) {
  // Single unconditional useSWR call Ã¢â‚¬â€ options vary; Hook order does not.
  return useSWR<T>(path, fetcher, buildUseLiveApiSwrOptions(options));
}

export { LIVE_POLL_MATCH_MS, LIVE_POLL_HUB_MS };

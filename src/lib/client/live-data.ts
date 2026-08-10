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
  communityShieldFixture: "/api/community-shield/fixture",
  wc26Match: (fixtureId: string) =>
    `/api/wc26/match/${encodeURIComponent(fixtureId)}`,
} as const;

type UseLiveApiOptions<T = unknown> = {
  /** Poll interval in ms; omit for hub default (75s). Pass 30_000 for live match pages. */
  refreshInterval?: number;
  /** Use LIVE_MATCH_FETCH_SWR_OPTIONS — no stale data flash on live/home match sections. */
  fresh?: boolean;
  /** Server-seeded or parent-provided initial payload for SWR. */
  fallbackData?: T;
};

/** Build SWR options for useLiveApi — pure helper for hook-stable single useSWR call. */
export function buildUseLiveApiSwrOptions<T = unknown>(
  options?: UseLiveApiOptions<T>,
) {
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
      fallbackData: options?.fallbackData,
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
    fallbackData: options?.fallbackData,
  };
}

export function useLiveApi<T = unknown>(
  path: string | null,
  options?: UseLiveApiOptions<T>,
) {
  // Single unconditional useSWR call — options vary; Hook order does not.
  return useSWR<T>(path, fetcher, buildUseLiveApiSwrOptions(options));
}

export { LIVE_POLL_MATCH_MS, LIVE_POLL_HUB_MS };

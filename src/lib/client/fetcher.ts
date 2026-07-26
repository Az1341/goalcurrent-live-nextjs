import { mutate } from "swr";

export const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json());

/** Active live match centre / match detail polling. */
export const LIVE_POLL_MATCH_MS = 15_000;

/** Hub, home, and general scoreboard polling (60–90s window). */
export const LIVE_POLL_HUB_MS = 75_000;

/** Returns 0 when the tab is hidden so SWR skips background polling. */
export function visibilityAwareRefreshInterval(intervalMs: number): number {
  if (intervalMs <= 0) {
    return 0;
  }
  if (typeof document === "undefined") {
    return intervalMs;
  }
  return document.hidden ? 0 : intervalMs;
}

/**
 * Visibility policy for live SWR caches.
 * - Hidden: do nothing (refreshInterval already pauses); never wipe cache.
 * - Visible: revalidate matching keys without clearing cached data.
 */
export function onLivePollingVisibilityChange(
  isHidden: boolean,
  revalidateMatching: (filter: (key: unknown) => boolean) => void,
): void {
  if (isHidden) {
    return;
  }
  revalidateMatching(() => true);
}

function buildLiveSwrOptions(pollMs: number) {
  return {
    refreshInterval: () => visibilityAwareRefreshInterval(pollMs),
    dedupingInterval: pollMs,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  };
}

/** Default for hub/home components — slower cadence, visibility-aware. */
export const LIVE_SWR_OPTIONS = buildLiveSwrOptions(LIVE_POLL_HUB_MS);

/** Live match pages — 30s cadence, visibility-aware. */
export const LIVE_MATCH_SWR_OPTIONS = buildLiveSwrOptions(LIVE_POLL_MATCH_MS);

/** SWR options for live match surfaces — no stale cache flash on mount. */
export const LIVE_MATCH_FETCH_SWR_OPTIONS = {
  revalidateOnMount: true,
  revalidateOnFocus: false,
  fallbackData: undefined,
  keepPreviousData: false,
  refreshInterval: () => visibilityAwareRefreshInterval(LIVE_POLL_MATCH_MS),
  dedupingInterval: LIVE_POLL_MATCH_MS,
  revalidateOnReconnect: true,
} as const;

function registerVisibilityPollingControl(): void {
  if (typeof document === "undefined") {
    return;
  }
  document.addEventListener("visibilitychange", () => {
    onLivePollingVisibilityChange(document.hidden, (filter) => {
      void mutate(filter);
    });
  });
}

registerVisibilityPollingControl();

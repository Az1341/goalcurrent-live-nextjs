"use client";

import useSWR from "swr";
import {
  fetcher,
  LIVE_POLL_HUB_MS,
  visibilityAwareRefreshInterval,
} from "@/lib/client/fetcher";
import { LIVE_API_PATHS } from "@/lib/client/live-data";
import { isLiveUnlStatus } from "@/lib/unl/contract";
import type { UnlFixturesApiResponse } from "@/lib/unl/types";

/**
 * Single SWR owner for /api/unl/fixtures.
 * Polls only while a live Nations League match is present; otherwise stops revalidation.
 */
export function useLiveUnlFixtures() {
  return useSWR<UnlFixturesApiResponse>(
    LIVE_API_PATHS.unlFixtures,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: LIVE_POLL_HUB_MS,
      refreshInterval: (latest) => {
        const hasLive = Boolean(
          latest?.fixtures?.some((row) => isLiveUnlStatus(row.status)),
        );
        return visibilityAwareRefreshInterval(hasLive ? LIVE_POLL_HUB_MS : 0);
      },
    },
  );
}
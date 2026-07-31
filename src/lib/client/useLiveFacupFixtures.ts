"use client";

import useSWR from "swr";
import {
  fetcher,
  LIVE_POLL_HUB_MS,
  visibilityAwareRefreshInterval,
} from "@/lib/client/fetcher";
import { LIVE_API_PATHS } from "@/lib/client/live-data";
import { isLiveFacupStatus } from "@/lib/facup/contract";
import type { FacupFixturesApiResponse } from "@/lib/facup/types";

/**
 * Single SWR owner for /api/facup/fixtures.
 * Polls only while a live FA Cup match is present; otherwise stops revalidation.
 */
export function useLiveFacupFixtures() {
  return useSWR<FacupFixturesApiResponse>(
    LIVE_API_PATHS.facupFixtures,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: LIVE_POLL_HUB_MS,
      refreshInterval: (latest) => {
        const hasLive = Boolean(
          latest?.fixtures?.some((row) => isLiveFacupStatus(row.status)),
        );
        return visibilityAwareRefreshInterval(hasLive ? LIVE_POLL_HUB_MS : 0);
      },
    },
  );
}
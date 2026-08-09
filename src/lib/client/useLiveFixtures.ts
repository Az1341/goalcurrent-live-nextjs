"use client";

import { LIVE_API_PATHS, useLiveApi } from "@/lib/client/live-data";
import type { PlFixturesApiResponse } from "@/lib/pl/types";

export function useLiveFixtures(initialData?: PlFixturesApiResponse) {
  return useLiveApi<PlFixturesApiResponse>(LIVE_API_PATHS.plFixtures, {
    fallbackData: initialData,
  });
}

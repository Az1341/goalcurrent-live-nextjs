"use client";

import { LIVE_API_PATHS, useLiveApi } from "@/lib/client/live-data";
import type { UclFixturesApiResponse } from "@/lib/ucl/types";

/** Single SWR owner for /api/ucl/fixtures (FE-010-style isolation from PL). */
export function useLiveUclFixtures() {
  return useLiveApi<UclFixturesApiResponse>(LIVE_API_PATHS.uclFixtures);
}
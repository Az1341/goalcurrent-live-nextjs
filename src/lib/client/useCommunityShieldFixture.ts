"use client";

import { LIVE_API_PATHS, useLiveApi } from "@/lib/client/live-data";
import type { CommunityShieldFixturesApiResponse } from "@/lib/community-shield/types";

export function useCommunityShieldFixture(
  initialData?: CommunityShieldFixturesApiResponse,
) {
  return useLiveApi<CommunityShieldFixturesApiResponse>(
    LIVE_API_PATHS.communityShieldFixture,
    { fallbackData: initialData },
  );
}

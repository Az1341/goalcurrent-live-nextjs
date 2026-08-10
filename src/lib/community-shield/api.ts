import {
  COMMUNITY_SHIELD_COMPETITION,
  COMMUNITY_SHIELD_SEASON,
} from "@/lib/community-shield/constants";
import { getCommunityShieldFixtures } from "@/lib/community-shield/fixtures-ssot";
import type { CommunityShieldFixturesApiResponse } from "@/lib/community-shield/types";

/** SSOT response wrapper — mirrors pl/api ssotFixturesResponse shape at small scale. */
export function ssotCommunityShieldFixturesResponse(): CommunityShieldFixturesApiResponse {
  return {
    configured: true,
    competition: COMMUNITY_SHIELD_COMPETITION,
    season: COMMUNITY_SHIELD_SEASON,
    fixtures: getCommunityShieldFixtures(),
    source: "fallback",
    fetchedAt: new Date().toISOString(),
  };
}

export function communityShieldFixturesCacheControl(): string {
  return "s-maxage=3600, stale-while-revalidate=300";
}

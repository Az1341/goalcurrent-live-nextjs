import {
  cacheKeyCompetitionPrefix,
  competitionResourceCacheKey,
} from "@/lib/competitions/cache-keys";
import { UNL_LEAGUE_ID, UNL_SEASON } from "@/lib/unl/constants";

/** Competition-and-season-specific cache keys — never share with PL/UCL/WC26. */
export function unlFixturesCacheKey(
  leagueId: number = UNL_LEAGUE_ID,
  season: number = UNL_SEASON,
): string {
  return competitionResourceCacheKey("unl", "fixtures", leagueId, season);
}

export function unlStandingsCacheKey(
  leagueId: number = UNL_LEAGUE_ID,
  season: number = UNL_SEASON,
  groupId?: string,
): string {
  const base = competitionResourceCacheKey("unl", "standings", leagueId, season);
  return groupId ? `${base}:${groupId}` : base;
}

export function isUnlCacheKey(key: string): boolean {
  return key.startsWith("unl:");
}

export { cacheKeyCompetitionPrefix };
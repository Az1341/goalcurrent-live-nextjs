import {
  cacheKeyCompetitionPrefix,
  competitionResourceCacheKey,
} from "@/lib/competitions/cache-keys";
import { UCL_LEAGUE_ID, UCL_SEASON } from "@/lib/ucl/constants";

/** Competition-and-season-specific cache keys — never share with PL/WC26/FA Cup. */
export function uclFixturesCacheKey(
  leagueId: number = UCL_LEAGUE_ID,
  season: number = UCL_SEASON,
): string {
  return competitionResourceCacheKey("ucl", "fixtures", leagueId, season);
}

export function uclStandingsCacheKey(
  leagueId: number = UCL_LEAGUE_ID,
  season: number = UCL_SEASON,
): string {
  return competitionResourceCacheKey("ucl", "standings", leagueId, season);
}

export function isUclCacheKey(key: string): boolean {
  return key.startsWith("ucl:");
}

export { cacheKeyCompetitionPrefix };
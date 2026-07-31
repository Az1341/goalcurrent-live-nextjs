import {
  cacheKeyCompetitionPrefix,
  competitionResourceCacheKey,
} from "@/lib/competitions/cache-keys";
import { FACUP_LEAGUE_ID, FACUP_SEASON } from "@/lib/facup/constants";

export function facupFixturesCacheKey(
  leagueId: number = FACUP_LEAGUE_ID,
  season: number = FACUP_SEASON,
): string {
  return competitionResourceCacheKey("facup", "fixtures", leagueId, season);
}

export function isFacupCacheKey(key: string): boolean {
  return key.startsWith("facup:");
}

export { cacheKeyCompetitionPrefix };
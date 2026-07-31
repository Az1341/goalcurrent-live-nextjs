import { UCL_LEAGUE_ID, UCL_SEASON } from "@/lib/ucl/constants";

/** Competition-and-season-specific cache keys — never share with PL/WC26. */
export function uclFixturesCacheKey(
  leagueId: number = UCL_LEAGUE_ID,
  season: number = UCL_SEASON,
): string {
  return `ucl:fixtures:${leagueId}:${season}`;
}

export function uclStandingsCacheKey(
  leagueId: number = UCL_LEAGUE_ID,
  season: number = UCL_SEASON,
): string {
  return `ucl:standings:${leagueId}:${season}`;
}

export function isUclCacheKey(key: string): boolean {
  return key.startsWith("ucl:");
}

export function cacheKeyCompetitionPrefix(key: string): string | null {
  const idx = key.indexOf(":");
  if (idx <= 0) return null;
  return key.slice(0, idx);
}
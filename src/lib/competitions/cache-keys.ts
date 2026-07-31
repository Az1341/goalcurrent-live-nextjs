/**
 * Competition-neutral cache key helpers.
 * Format: `${competitionKey}:${resource}:${leagueId}:${season}`
 */

export function competitionResourceCacheKey(
  competitionKey: string,
  resource: string,
  leagueId: number,
  season: number,
): string {
  return `${competitionKey}:${resource}:${leagueId}:${season}`;
}

export function cacheKeyCompetitionPrefix(key: string): string | null {
  const idx = key.indexOf(":");
  if (idx <= 0) return null;
  return key.slice(0, idx);
}
import { getCached, setCached } from "@/lib/server/cache";

/** Fresh success TTL default (5 minutes). */
export const API_FOOTBALL_FRESH_TTL_MS = 300_000;

/** Extended stale-on-failure retention (15 minutes). */
export const API_FOOTBALL_STALE_TTL_MS = 900_000;

/**
 * Public, non-sensitive marker that a failure response includes retained success data.
 * BE-012 — clients must not treat this payload as a fresh upstream success.
 */
export const GC_STALE_RESPONSE_HEADER = "X-GC-Stale";

const STALE_KEY_PREFIX = "stale:";

export function staleApiCacheKey(key: string): string {
  return `${STALE_KEY_PREFIX}${key}`;
}

export function getStaleApiCache<T>(key: string): T | null {
  const value = getCached(staleApiCacheKey(key));
  return value ? (value as T) : null;
}

/**
 * Record a successful upstream payload for fresh hits and longer stale fallback.
 * Fresh and stale keys share competition/season/query identity via `key`.
 */
export function setSuccessApiCache(
  key: string,
  value: unknown,
  ttlMs = API_FOOTBALL_FRESH_TTL_MS,
): void {
  setCached(key, value, ttlMs);
  setCached(staleApiCacheKey(key), value, API_FOOTBALL_STALE_TTL_MS);
}

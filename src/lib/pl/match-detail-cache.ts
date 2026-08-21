import { getStaleApiCache, setSuccessApiCache } from "@/lib/api-football/cache";
import { fetchPlMatchDetail } from "@/lib/pl/match-detail";
import type { PlMatchApiResponse } from "@/lib/pl/types";
import { getCached } from "@/lib/server/cache";

export const PL_MATCH_LIVE_TTL_MS = 30_000;
export const PL_MATCH_UPCOMING_TTL_MS = 300_000;
export const PL_MATCH_FINISHED_TTL_MS = 900_000;

const inflight = new Map<string, Promise<PlMatchApiResponse>>();

export function plMatchDetailCacheKey(fixtureId: number): string {
  return `pl:match:${fixtureId}`;
}

export function plMatchDetailFreshTtlMs(body: PlMatchApiResponse): number {
  if (body.fixture?.status === "LIVE") return PL_MATCH_LIVE_TTL_MS;
  if (body.fixture?.status === "UPCOMING") return PL_MATCH_UPCOMING_TTL_MS;
  if (body.fixture?.status === "FT") return PL_MATCH_FINISHED_TTL_MS;
  return PL_MATCH_LIVE_TTL_MS;
}

export async function getCachedPlMatchDetail(
  fixtureId: number,
  locale = "en-GB",
): Promise<PlMatchApiResponse> {
  const key = plMatchDetailCacheKey(fixtureId);

  const fresh = getCached(key);
  if (fresh) return fresh as PlMatchApiResponse;

  const pending = inflight.get(key);
  if (pending) return pending;

  const request = (async () => {
    try {
      const body = await fetchPlMatchDetail(fixtureId, locale);

      if (body.fixture) {
        setSuccessApiCache(key, body, plMatchDetailFreshTtlMs(body));
        return body;
      }

      const definitiveNotFound =
        body.error?.includes("Fixture not found") ||
        body.error?.includes("not a Premier League");

      if (!definitiveNotFound) {
        const stale = getStaleApiCache<PlMatchApiResponse>(key);
        if (stale?.fixture) {
          return {
            ...stale,
            stale: true,
            apiAvailable: false,
            fetchedAt: new Date().toISOString(),
            error: body.error ?? "Serving retained match data while the provider is unavailable.",
          };
        }
      }

      return body;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, request);
  return request;
}

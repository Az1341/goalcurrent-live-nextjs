import { getStaleApiCache, setSuccessApiCache } from "@/lib/api-football/cache";
import {
  fetchPlMatchDetail,
  plMatchCacheControl,
} from "@/lib/pl/match-detail";
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

export function plMatchDetailResponseCacheControl(
  body: PlMatchApiResponse,
): string {
  if (body.stale || !body.fixture) return "no-store";
  return plMatchCacheControl(body);
}

/** Prime both fresh and retained-success cache entries from a verified fixture payload. */
export function primePlMatchDetailCache(body: PlMatchApiResponse): void {
  if (!body.fixture) return;
  setSuccessApiCache(
    plMatchDetailCacheKey(body.fixtureId),
    body,
    plMatchDetailFreshTtlMs(body),
  );
}

export function resolvePlMatchDetailFallback(
  failed: PlMatchApiResponse,
  stale: PlMatchApiResponse | null,
): PlMatchApiResponse {
  const definitiveNotFound =
    failed.error?.includes("Fixture not found") ||
    failed.error?.includes("not a Premier League");

  if (definitiveNotFound || !stale?.fixture) return failed;

  return {
    ...stale,
    stale: true,
    apiAvailable: false,
    fetchedAt: new Date().toISOString(),
    error:
      failed.error ??
      "Serving retained match data while the provider is unavailable.",
  };
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
        primePlMatchDetailCache(body);
        return body;
      }

      return resolvePlMatchDetailFallback(
        body,
        getStaleApiCache<PlMatchApiResponse>(key),
      );
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, request);
  return request;
}

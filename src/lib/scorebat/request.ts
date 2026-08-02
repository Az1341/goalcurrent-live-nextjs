/** Official ScoreBat v3 feed endpoint (token must be a query param per provider docs). */
export const SCOREBAT_FEED_URL = "https://www.scorebat.com/video-api/v3/feed/";

export function getScoreBatApiToken(): string | undefined {
  return process.env.SCOREBAT_API_TOKEN?.trim() || undefined;
}

/** Build the provider-required feed URL. Prefer redactScoreBatUrl for any logging. */
export function buildScoreBatFeedUrl(token: string): string {
  const url = new URL(SCOREBAT_FEED_URL);
  url.searchParams.set("token", token);
  return url.toString();
}

/** Strip ScoreBat access tokens from URLs before logging or fixtures. */
export function redactScoreBatUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has("token")) {
      parsed.searchParams.set("token", "[REDACTED]");
    }
    return parsed.toString();
  } catch {
    return url.replace(/([?&]token=)[^&]*/gi, "$1[REDACTED]");
  }
}

export type ScoreBatFeedFetchInit = RequestInit & {
  next?: { revalidate?: number };
};

/**
 * Fetch the ScoreBat v3 feed.
 * Provider requires `?token=` (no documented header auth). Never log the raw URL —
 * use redactScoreBatUrl if diagnostics are needed.
 */
export async function fetchScoreBatFeed(
  init?: ScoreBatFeedFetchInit,
): Promise<Response | null> {
  const token = getScoreBatApiToken();
  if (!token) {
    return null;
  }

  const url = buildScoreBatFeedUrl(token);
  try {
    return await fetch(url, init);
  } catch (error) {
    console.error(
      "[scorebat] feed fetch failed",
      redactScoreBatUrl(url),
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
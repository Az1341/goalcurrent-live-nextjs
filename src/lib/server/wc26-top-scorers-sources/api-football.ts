import type { ApiFootballTopScorersResult } from "./types";

function emptyResult(): ApiFootballTopScorersResult {
  return {
    scorers: [],
    totalGoals: 0,
    apiAvailable: false,
    matchesProcessed: 0,
    matchesWithVerifiedEvents: 0,
    matchesExcluded: 0,
  };
}

/** WC26 is complete and archived. This source must never call API-Football again. */
export async function fetchApiFootballWc26TopScorers(): Promise<ApiFootballTopScorersResult> {
  console.info("API-FOOTBALL WC26 top scorers: disabled for archive mode");
  return emptyResult();
}

/** Raw API-Football JSON is disabled for WC26 archive mode. */
export async function fetchApiFootballRawJson(_path?: string): Promise<unknown> {
  return {
    errors: { wc26: "WC26 is archived; API-Football requests are disabled." },
    response: [],
  };
}

/** Raw topscorers endpoint response for WC26 is disabled in archive mode. */
export async function fetchWc26TopScorersRaw(): Promise<unknown> {
  return fetchApiFootballRawJson();
}

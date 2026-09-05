import type { Wc26TopScorersResponse } from "@/types/wc26-top-scorers";

function archiveResponse(): Wc26TopScorersResponse {
  return {
    scorers: [],
    totalGoals: 0,
    configured: false,
    apiAvailable: false,
    matchesProcessed: 0,
    matchesWithVerifiedEvents: 0,
    matchesExcluded: 0,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchWc26TopScorers(): Promise<Wc26TopScorersResponse> {
  console.info("WC26 top scorers pipeline: archive static response");
  return archiveResponse();
}

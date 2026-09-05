"use client";

import { useLiveApi } from "@/lib/client/live-data";
import type { Wc26TopScorersResponse } from "@/types/wc26-top-scorers";

function archiveFallback(): Wc26TopScorersResponse {
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

export function useLiveTopScorers(_enabled = true) {
  return useLiveApi<Wc26TopScorersResponse>(null, {
    fallbackData: archiveFallback(),
    refreshInterval: 0,
  });
}

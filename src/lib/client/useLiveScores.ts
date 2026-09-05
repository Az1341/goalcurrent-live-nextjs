"use client";

import { useLiveApi } from "@/lib/client/live-data";
import type { Wc26ScoresApiResponse } from "@/types/fixture-overlay";

function archiveFallback(): Wc26ScoresApiResponse {
  return {
    matches: [],
    fetchedAt: new Date().toISOString(),
    configured: false,
    phase: "archive-static",
  };
}

export function useLiveScores() {
  return useLiveApi<Wc26ScoresApiResponse>(null, {
    fallbackData: archiveFallback(),
    refreshInterval: 0,
  });
}

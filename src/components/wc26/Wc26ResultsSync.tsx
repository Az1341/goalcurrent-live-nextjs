"use client";

import { useEffect } from "react";
import {
  LIVE_API_PATHS,
  LIVE_POLL_HUB_MS,
  useLiveApi,
} from "@/lib/client/live-data";
import { applyWc26ScoresToOverlay } from "@/lib/wc26-results-sync";
import { isWc26TournamentComplete } from "@/lib/wc26/archive";
import type { Wc26ScoresApiResponse } from "@/types/fixture-overlay";

/**
 * Invisible client bootstrap — feeds WC26 overlay from unified SWR caches.
 * Mount only on live/match surfaces (FE-004); bracket uses BracketLivePolling.
 */
export default function Wc26ResultsSync() {
  const archiveComplete = isWc26TournamentComplete();
  const livePath = archiveComplete ? null : LIVE_API_PATHS.wc26LiveScores;
  const resultsPath = archiveComplete ? null : LIVE_API_PATHS.wc26Results;

  const { data: liveData } = useLiveApi<Wc26ScoresApiResponse>(livePath, {
    fresh: true,
  });
  const { data: resultsData } = useLiveApi<Wc26ScoresApiResponse>(resultsPath, {
    refreshInterval: LIVE_POLL_HUB_MS,
  });

  useEffect(() => {
    if (liveData) {
      applyWc26ScoresToOverlay(liveData);
    }
  }, [liveData]);

  useEffect(() => {
    if (resultsData) {
      applyWc26ScoresToOverlay(resultsData);
    }
  }, [resultsData]);

  return null;
}
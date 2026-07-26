"use client";

import dynamic from "next/dynamic";
import ApiFootballStatusBanner from "@/components/system/ApiFootballStatusBanner";
import Wc26ResultsSync from "@/components/wc26/Wc26ResultsSync";
import { useLiveScores } from "@/lib/client/useLiveScores";
import { useMatchDetail } from "@/lib/use-match-detail";

import type { ScoreBatHighlight } from "@/lib/scorebat/types";

const MatchDetailContent = dynamic(
  () => import("@/components/match/MatchDetailContent"),
  { ssr: true, loading: () => null },
);

type MatchPageClientProps = {
  fixtureId: string;
  scorebatHighlight?: ScoreBatHighlight | null;
};

/** Client shell — shares unified live-scores SWR cache with scoreboard and overlay sync. */
export default function MatchPageClient({
  fixtureId,
  scorebatHighlight = null,
}: MatchPageClientProps) {
  useLiveScores();
  const { detail, loading } = useMatchDetail(fixtureId, true);

  return (
    <>
      <Wc26ResultsSync />
      <ApiFootballStatusBanner
        errorCode={detail.error}
        message={
          detail.error
            ? detail.message ?? "Detailed live data is temporarily unavailable."
            : undefined
        }
        fetchedAt={detail.stale ? detail.fetchedAt : undefined}
      />
      <MatchDetailContent
        fixtureId={fixtureId}
        detail={detail}
        loading={loading}
        detailUnavailable={Boolean(detail.error)}
        scorebatHighlight={scorebatHighlight}
      />
    </>
  );
}

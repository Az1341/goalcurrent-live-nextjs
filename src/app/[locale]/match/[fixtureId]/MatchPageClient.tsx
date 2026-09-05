"use client";

import dynamic from "next/dynamic";
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

/** Client shell for WC26 archive match pages. */
export default function MatchPageClient({
  fixtureId,
  scorebatHighlight = null,
}: MatchPageClientProps) {
  const { detail, loading } = useMatchDetail(fixtureId, false);

  return (
    <MatchDetailContent
      fixtureId={fixtureId}
      detail={detail}
      loading={loading}
      detailUnavailable={false}
      scorebatHighlight={scorebatHighlight}
    />
  );
}

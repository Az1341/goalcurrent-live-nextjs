"use client";

import { useMemo, useState } from "react";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { useEffectiveFixtures } from "@/lib/use-effective-fixtures";
import { isLiveMatchStatus, resolveFixtureParticipantLabel } from "@/lib/wc26-live";
import dynamic from "next/dynamic";

const LiveMatchCentre = dynamic(
  () => import("@/components/live/LiveMatchCentre"),
  { ssr: true, loading: () => null },
);

/** Client shell for /live. WC26 is archive-only; active live data belongs to current competitions. */
export default function LivePageClient() {
  const fixtures = useEffectiveFixtures();
  const [coverageStartTime] = useState(() => new Date().toISOString());

  const liveMatches = useMemo(
    () => fixtures.filter((fixture) => isLiveMatchStatus(fixture.status)),
    [fixtures],
  );

  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "LiveBlogPosting",
      headline: "Live Football Scores",
      coverageStartTime,
      liveBlogUpdate: liveMatches.map((fixture) => {
        const homeName = resolveFixtureParticipantLabel(fixture, "home", fixtures);
        const awayName = resolveFixtureParticipantLabel(fixture, "away", fixtures);

        return {
          "@type": "BlogPosting",
          headline: `${homeName} vs ${awayName}`,
          datePublished: fixture.kickoffUtc,
        };
      }),
    }),
    [coverageStartTime, fixtures, liveMatches],
  );

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <LiveMatchCentre />
    </>
  );
}

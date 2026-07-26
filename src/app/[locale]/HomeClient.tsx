"use client";

import useSWR from "swr";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useEffectiveFixtures } from "@/lib/use-effective-fixtures";
import {
  buildHomepageMatchView,
  selectFeaturedFixtures,
  selectHomepageFixtures,
} from "@/lib/wc26-live";
import { fetcher, LIVE_SWR_OPTIONS } from "@/lib/client/fetcher";
import type { PlFixturesApiResponse } from "@/lib/pl/types";
import LiveRibbon from "@/components/layout/LiveRibbon";
import HomeHero from "@/components/home/v5/HomeHero";
import HomeChampionSnippet from "@/components/home/v5/HomeChampionSnippet";
import { isWc26TournamentComplete } from "@/lib/wc26/archive";
import styles from "@/components/home/home-v5.module.css";

const HomeTodaysMatches = dynamic(
  () => import("@/components/home/v5/HomeTodaysMatches"),
  { loading: () => <div className={`${styles.skeleton} animate-skeleton-shimmer`} /> },
);

const HomeLatestNews = dynamic(
  () => import("@/components/home/v5/HomeLatestNews"),
  { loading: () => <div className={`${styles.skeleton} animate-skeleton-shimmer`} /> },
);

const HomeTrendingClips = dynamic(
  () => import("@/components/home/v5/HomeTrendingClips"),
  {
    ssr: false,
    loading: () => <div className={`${styles.skeleton} animate-skeleton-shimmer`} />,
  },
);

const HomeTeamsLeagues = dynamic(
  () => import("@/components/home/v5/HomeTeamsLeagues"),
  { loading: () => <div className={`${styles.skeleton} animate-skeleton-shimmer`} /> },
);

export default function HomeClient() {
  const fixtures = useEffectiveFixtures();
  const featuredSelection = selectFeaturedFixtures(fixtures);
  const featuredMatch = featuredSelection.fixtures[0]
    ? buildHomepageMatchView(featuredSelection.fixtures[0], fixtures)
    : undefined;

  const { data: plData } = useSWR<PlFixturesApiResponse>(
    "/api/pl/fixtures",
    fetcher,
    LIVE_SWR_OPTIONS,
  );

  const archiveComplete = isWc26TournamentComplete();
  const heroWc26Views = useMemo(
    () => (archiveComplete ? [] : selectHomepageFixtures(fixtures, [], 3)),
    [fixtures, archiveComplete],
  );

  const plFixtures = plData?.fixtures ?? [];

  return (
    <div className={styles.root} data-gc-home-v5>
      <div className={styles.tickerWrap}>
        <LiveRibbon embedded variant="v5" />
      </div>

      <main className={styles.main}>
        <HomeChampionSnippet />
        <HomeHero
          featuredMatch={featuredMatch}
          wc26Views={heroWc26Views}
          plFixtures={plFixtures}
        />
        <HomeTodaysMatches fixtures={fixtures} plFixtures={plFixtures} />
        <HomeLatestNews />
        <HomeTrendingClips />
        <HomeTeamsLeagues fixtures={fixtures} plFixtures={plFixtures} />
      </main>
    </div>
  );
}

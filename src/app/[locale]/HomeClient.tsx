"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useEffectiveFixtures } from "@/lib/use-effective-fixtures";
import {
  selectHomepageFixtures,
} from "@/lib/wc26-live";
import { selectHomeFeaturedContent } from "@/lib/home/featured-selection";
import { useLiveFixtures } from "@/lib/client/useLiveFixtures";
import HomeHero from "@/components/home/v5/HomeHero";
import HomeChampionSnippet from "@/components/home/v5/HomeChampionSnippet";
import HomeCommunityShieldCountdown from "@/components/home/v5/HomeCommunityShieldCountdown";
import HomePlKickoffCountdown from "@/components/home/v5/HomePlKickoffCountdown";
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
  const { data: plData, isLoading: plLoading } = useLiveFixtures();
  const plFixtures = plData?.fixtures ?? [];

  const { featuredMatch } = selectHomeFeaturedContent(
    fixtures,
    plFixtures,
  );

  const archiveComplete = isWc26TournamentComplete();
  const heroWc26Views = useMemo(
    () => (archiveComplete ? [] : selectHomepageFixtures(fixtures, [], 3)),
    [fixtures, archiveComplete],
  );

  return (
    <div className={styles.root} data-gc-home-v5>
      <main className={styles.main}>
        <HomeCommunityShieldCountdown />
        <HomeChampionSnippet />
        <HomePlKickoffCountdown
          plFixtures={plFixtures}
          loading={plLoading && !plData}
        />
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

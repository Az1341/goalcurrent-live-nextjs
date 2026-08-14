"use client";

import dynamic from "next/dynamic";
import { useLiveFixtures } from "@/lib/client/useLiveFixtures";
import HomeHero from "@/components/home/v5/HomeHero";
import HomePlKickoffCountdown from "@/components/home/v5/HomePlKickoffCountdown";
import HomeCommunityShieldNews from "@/components/home/v5/HomeCommunityShieldNews";
import HomeEcosystemPromo from "@/components/home/v5/HomeEcosystemPromo";
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
  const { data: plData, isLoading: plLoading } = useLiveFixtures();
  const plFixtures = plData?.fixtures ?? [];

  return (
    <div className={styles.root} data-gc-home-v5>
      <main className={styles.main}>
        <HomePlKickoffCountdown
          plFixtures={plFixtures}
          loading={plLoading && !plData}
        />
        <HomeHero featuredMatch={undefined} wc26Views={[]} plFixtures={plFixtures} />
        <HomeTodaysMatches plFixtures={plFixtures} />
        <HomeCommunityShieldNews />
        <HomeLatestNews />
        <HomeEcosystemPromo />
        <HomeTrendingClips />
        <HomeTeamsLeagues plFixtures={plFixtures} />
      </main>
    </div>
  );
}

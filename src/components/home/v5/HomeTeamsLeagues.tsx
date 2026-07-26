"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import {
  isLiveMatchStatus,
  partitionFixturesForLiveCentre,
} from "@/lib/wc26-live";
import type { EffectiveFixture } from "@/lib/wc26-fixture-overlay";
import type { PlFixtureRow } from "@/lib/pl/types";
import { isLocalToday } from "@/lib/date-utils";
import styles from "../home-v5.module.css";

type HomeTeamsLeaguesProps = {
  fixtures: readonly EffectiveFixture[];
  plFixtures?: readonly PlFixtureRow[];
};

export default function HomeTeamsLeagues({
  fixtures,
  plFixtures = [],
}: HomeTeamsLeaguesProps) {

  const wc26TodayCount = useMemo(() => {
    const buckets = partitionFixturesForLiveCentre(fixtures);
    const ids = new Set<string>();
    for (const f of [...buckets.live, ...buckets.today]) {
      if (isLocalToday(f.kickoffUtc) || isLiveMatchStatus(f.status)) {
        ids.add(f.id);
      }
    }
    return ids.size;
  }, [fixtures]);

  const plTodayCount = useMemo(() => {
    return plFixtures.filter((f) => isLocalToday(f.kickoffUtc)).length;
  }, [plFixtures]);

  return (
    <section className={styles.section} aria-labelledby="home-leagues-heading">
      <h2 id="home-leagues-heading" className={styles.sectionTitle}>
        Teams &amp; Leagues
      </h2>
      <div className={styles.leagueCards}>
        <Link href="/worldcup2026" className={styles.leagueCard}>
          <span className={styles.leagueCardIcon} aria-hidden="true">
            🏆
          </span>
          <span className={styles.leagueCardBody}>
            <span className={styles.leagueCardTitle}>World Cup 2026</span>
            <span className={styles.leagueCardMeta}>
              World Cup 2026 Archive
            </span>
          </span>
        </Link>
        <Link href="/premier-league" className={styles.leagueCard}>
          <span className={styles.leagueCardIcon} aria-hidden="true">
            ⚽
          </span>
          <span className={styles.leagueCardBody}>
            <span className={styles.leagueCardTitle}>Premier League 26/27</span>
            <span className={styles.leagueCardMeta}>
              {plTodayCount} match{plTodayCount === 1 ? "" : "es"} today
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}

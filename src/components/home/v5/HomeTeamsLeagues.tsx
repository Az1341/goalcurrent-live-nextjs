"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import type { PlFixtureRow } from "@/lib/pl/types";
import { isLocalToday } from "@/lib/date-utils";
import styles from "../home-v5.module.css";

type HomeTeamsLeaguesProps = {
  plFixtures?: readonly PlFixtureRow[];
};

export default function HomeTeamsLeagues({
  plFixtures = [],
}: HomeTeamsLeaguesProps) {
  const plTodayCount = useMemo(
    () => plFixtures.filter((fixture) => isLocalToday(fixture.kickoffUtc)).length,
    [plFixtures],
  );

  return (
    <section className={styles.section} aria-labelledby="home-leagues-heading">
      <h2 id="home-leagues-heading" className={styles.sectionTitle}>
        Teams &amp; Leagues
      </h2>
      <div className={styles.leagueCards}>
        <Link href="/premier-league" className={styles.leagueCard}>
          <span className={styles.leagueCardIcon} aria-hidden="true">⚽</span>
          <span className={styles.leagueCardBody}>
            <span className={styles.leagueCardTitle}>Premier League 26/27</span>
            <span className={styles.leagueCardMeta}>
              {plTodayCount} match{plTodayCount === 1 ? "" : "es"} today
            </span>
          </span>
        </Link>

        <Link href="/community-shield" className={styles.leagueCard}>
          <span className={styles.leagueCardIcon} aria-hidden="true">🏆</span>
          <span className={styles.leagueCardBody}>
            <span className={styles.leagueCardTitle}>Community Shield</span>
            <span className={styles.leagueCardMeta}>Arsenal vs Manchester City</span>
          </span>
        </Link>

        <Link href="/champions-league" className={styles.leagueCard}>
          <span className={styles.leagueCardIcon} aria-hidden="true">★</span>
          <span className={styles.leagueCardBody}>
            <span className={styles.leagueCardTitle}>Champions League 26/27</span>
            <span className={styles.leagueCardMeta}>Fixtures, results and standings</span>
          </span>
        </Link>

        <Link href="/fa-cup" className={styles.leagueCard}>
          <span className={styles.leagueCardIcon} aria-hidden="true">🏟</span>
          <span className={styles.leagueCardBody}>
            <span className={styles.leagueCardTitle}>FA Cup 26/27</span>
            <span className={styles.leagueCardMeta}>Fixtures, results and rounds</span>
          </span>
        </Link>
      </div>
    </section>
  );
}

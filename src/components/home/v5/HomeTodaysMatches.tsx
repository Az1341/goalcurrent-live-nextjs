"use client";

import { useMemo } from "react";
import type { PlFixtureRow } from "@/lib/pl/types";
import { isLocalToday } from "@/lib/date-utils";
import { PlMatchCard } from "./HomeLiveMatchCards";
import styles from "../home-v5.module.css";

type HomeTodaysMatchesProps = {
  plFixtures?: readonly PlFixtureRow[];
};

export default function HomeTodaysMatches({
  plFixtures = [],
}: HomeTodaysMatchesProps) {
  const plToday = useMemo(
    () =>
      plFixtures
        .filter((fixture) => isLocalToday(fixture.kickoffUtc))
        .sort(
          (left, right) =>
            new Date(left.kickoffUtc).getTime() - new Date(right.kickoffUtc).getTime(),
        )
        .slice(0, 6),
    [plFixtures],
  );

  if (!plToday.length) return null;

  return (
    <section className={styles.todaySection} aria-labelledby="home-today-heading">
      <h2 id="home-today-heading" className={styles.sectionTitleLarge}>
        Today&apos;s Matches
      </h2>
      <div className={styles.todayLeagueGroups}>
        <div className={styles.todayLeagueGroup}>
          <div className={styles.todayGroupTitle}>
            <span className={styles.todayGroupIcon} aria-hidden="true">⚽</span>
            Premier League 26/27
          </div>
          <div className={styles.todayCardGrid}>
            {plToday.map((fixture) => (
              <PlMatchCard key={fixture.fixtureId} fixture={fixture} compact />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

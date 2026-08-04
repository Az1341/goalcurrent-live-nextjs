"use client";

import { useMemo } from "react";
import { useLiveFixtures } from "@/lib/client/useLiveFixtures";
import type { PlFixtureRow } from "@/lib/pl/types";
import { useLocalizedKickoffTime } from "@/lib/client/use-local-kickoff";
import styles from "../pastel.module.css";

function FixtureRow({ fixture }: { fixture: PlFixtureRow }) {
  const kickoff = useLocalizedKickoffTime(fixture.kickoffUtc);
  const isLive = fixture.status === "LIVE";
  const isDone = fixture.status === "FT";
  const scoreHome = fixture.homeScore ?? (isLive || isDone ? 0 : "-");
  const scoreAway = fixture.awayScore ?? (isLive || isDone ? 0 : "-");

  let statusLabel = kickoff;
  if (isLive) {
    statusLabel =
      fixture.elapsed != null ? `LIVE ${fixture.elapsed}'` : "LIVE";
  } else if (isDone) {
    statusLabel = "FT";
  } else if (fixture.status === "POSTPONED") {
    statusLabel = "PST";
  } else if (fixture.status === "CANCELLED") {
    statusLabel = "CANC";
  }

  return (
    <li className={styles.fixtureRow}>
      <span
        className={`${styles.fixtureStatus}${isLive ? ` ${styles.fixtureStatusLive}` : ""}`}
      >
        {statusLabel}
      </span>
      <div className={styles.fixtureTeams}>
        <span className={styles.fixtureTeam}>{fixture.homeTeamName}</span>
        <span className={styles.fixtureScore}>
          {scoreHome} - {scoreAway}
        </span>
        <span className={styles.fixtureTeam}>{fixture.awayTeamName}</span>
      </div>
    </li>
  );
}

export default function PastelLiveMatches() {
  const { data, error, isLoading } = useLiveFixtures();

  const { live, upcoming } = useMemo(() => {
    const fixtures = data?.fixtures ?? [];
    const liveList = fixtures.filter((f) => f.status === "LIVE");
    const upcomingList = fixtures
      .filter((f) => f.status === "UPCOMING")
      .slice(0, 8);
    return { live: liveList, upcoming: upcomingList };
  }, [data?.fixtures]);

  return (
    <section className={styles.liveSection} aria-labelledby="pastel-live-heading">
      <h2 id="pastel-live-heading" className={styles.sectionTitle}>
        Live Matches
      </h2>

      {isLoading && !data ? (
        <p className={styles.muted}>Loading fixtures…</p>
      ) : null}

      {error && !data ? (
        <p className={styles.muted} role="alert">
          Unable to load live fixtures right now.
        </p>
      ) : null}

      {!isLoading && data && live.length === 0 && upcoming.length === 0 ? (
        <p className={styles.muted}>No live or upcoming fixtures available.</p>
      ) : null}

      {live.length > 0 ? (
        <div className={styles.fixtureBlock}>
          <h3 className={styles.subsectionTitle}>Live</h3>
          <ul className={styles.fixtureList}>
            {live.map((f) => (
              <FixtureRow key={f.fixtureId} fixture={f} />
            ))}
          </ul>
        </div>
      ) : null}

      {upcoming.length > 0 ? (
        <div className={styles.fixtureBlock}>
          <h3 className={styles.subsectionTitle}>Upcoming</h3>
          <ul className={styles.fixtureList}>
            {upcoming.map((f) => (
              <FixtureRow key={f.fixtureId} fixture={f} />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

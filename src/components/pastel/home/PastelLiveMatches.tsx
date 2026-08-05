"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useLiveFixtures } from "@/lib/client/useLiveFixtures";
import type { PlFixtureRow } from "@/lib/pl/types";
import { useLocalizedKickoffTime } from "@/lib/client/use-local-kickoff";
import { PlTeamLogo } from "@/components/pl/PlShared";
import styles from "../pastel.module.css";

function FixtureCard({ fixture }: { fixture: PlFixtureRow }) {
  const kickoff = useLocalizedKickoffTime(fixture.kickoffUtc);
  const isLive = fixture.status === "LIVE";
  const isDone = fixture.status === "FT";
  const hasScore =
    isLive || isDone || (fixture.homeScore != null && fixture.awayScore != null);
  const scoreHome = hasScore ? (fixture.homeScore ?? 0) : null;
  const scoreAway = hasScore ? (fixture.awayScore ?? 0) : null;

  let statusLabel = kickoff;
  if (isLive) {
    const short = fixture.statusShort?.trim().toUpperCase();
    const period =
      short === "1H" ||
      short === "2H" ||
      short === "HT" ||
      short === "ET" ||
      short === "P"
        ? short === "P"
          ? "PEN"
          : short
        : null;
    statusLabel =
      fixture.elapsed != null
        ? `LIVE ${fixture.elapsed}'`
        : (period ?? "LIVE");
  } else if (isDone) {
    const short = fixture.statusShort?.trim().toUpperCase();
    statusLabel = short === "AET" || short === "PEN" ? short : "FT";
  } else if (fixture.status === "POSTPONED") {
    statusLabel = "PST";
  } else if (fixture.status === "CANCELLED") {
    statusLabel = "CANC";
  }

  const stateClass = isLive
    ? styles.fixtureCardLive
    : isDone
      ? styles.fixtureCardFt
      : styles.fixtureCardUpcoming;

  return (
    <li>
      <Link
        href={`/premier-league/match/${fixture.fixtureId}`}
        className={`${styles.fixtureCard} ${stateClass}`}
      >
        <div className={styles.fixtureCardTop}>
          <span className={styles.fixtureComp}>Premier League</span>
          <span
            className={`${styles.fixtureStatus}${isLive ? ` ${styles.fixtureStatusLive}` : ""}`}
          >
            {isLive ? <span className={styles.liveDot} aria-hidden /> : null}
            {statusLabel}
          </span>
        </div>
        <div className={styles.fixtureCardBody}>
          <div className={styles.fixtureTeamSide}>
            <span className={styles.teamBadgeCircle}>
              <PlTeamLogo
                name={fixture.homeTeamName}
                logo={fixture.homeTeamLogo}
                size={36}
                rounded
                className={styles.teamBadgeInner}
              />
            </span>
            <span className={styles.fixtureTeam}>{fixture.homeTeamName}</span>
          </div>
          <span
            className={styles.fixtureScore}
            aria-label={
              hasScore
                ? `${scoreHome} to ${scoreAway}`
                : `${fixture.homeTeamName} versus ${fixture.awayTeamName}`
            }
          >
            {hasScore ? (
              <>
                {scoreHome}
                <span className={styles.fixtureScoreSep}>–</span>
                {scoreAway}
              </>
            ) : (
              <span className={styles.fixtureVersus}>vs</span>
            )}
          </span>
          <div className={`${styles.fixtureTeamSide} ${styles.fixtureTeamSideAway}`}>
            <span className={styles.fixtureTeam}>{fixture.awayTeamName}</span>
            <span className={styles.teamBadgeCircle}>
              <PlTeamLogo
                name={fixture.awayTeamName}
                logo={fixture.awayTeamLogo}
                size={36}
                rounded
                className={styles.teamBadgeInner}
              />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export default function PastelLiveMatches() {
  const { data, error, isLoading } = useLiveFixtures();

  const { live, upcoming, finished } = useMemo(() => {
    const fixtures = data?.fixtures ?? [];
    return {
      live: fixtures.filter((f) => f.status === "LIVE"),
      upcoming: fixtures.filter((f) => f.status === "UPCOMING").slice(0, 8),
      finished: fixtures.filter((f) => f.status === "FT").slice(0, 4),
    };
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

      {!isLoading &&
      data &&
      live.length === 0 &&
      upcoming.length === 0 &&
      finished.length === 0 ? (
        <p className={styles.muted}>No live or upcoming fixtures available.</p>
      ) : null}

      {live.length > 0 ? (
        <div className={styles.fixtureBlock}>
          <h3 className={styles.subsectionTitle}>Live</h3>
          <ul className={styles.fixtureList}>
            {live.map((f) => (
              <FixtureCard key={f.fixtureId} fixture={f} />
            ))}
          </ul>
        </div>
      ) : null}

      {upcoming.length > 0 ? (
        <div className={styles.fixtureBlock}>
          <h3 className={styles.subsectionTitle}>Upcoming</h3>
          <ul className={styles.fixtureList}>
            {upcoming.map((f) => (
              <FixtureCard key={f.fixtureId} fixture={f} />
            ))}
          </ul>
        </div>
      ) : null}

      {live.length === 0 && finished.length > 0 ? (
        <div className={styles.fixtureBlock}>
          <h3 className={styles.subsectionTitle}>Recent</h3>
          <ul className={styles.fixtureList}>
            {finished.map((f) => (
              <FixtureCard key={f.fixtureId} fixture={f} />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

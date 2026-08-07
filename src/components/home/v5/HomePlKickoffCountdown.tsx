"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PlTeamLogo } from "@/components/pl/PlShared";
import {
  useLocalizedKickoffLabel,
  useIsClientMounted,
} from "@/lib/client/use-local-kickoff";
import { selectNextPlUpcomingFixture } from "@/lib/home/featured-selection";
import { splitCountdownParts } from "@/lib/home/pl-kickoff-countdown";
import { PL_LEAGUE_NAME } from "@/lib/pl/constants";
import type { PlFixtureRow } from "@/lib/pl/types";
import styles from "../home-v5.module.css";

type HomePlKickoffCountdownProps = {
  plFixtures: readonly PlFixtureRow[];
  /** When true, fixtures request has not resolved yet — render nothing. */
  loading?: boolean;
};

export default function HomePlKickoffCountdown({
  plFixtures,
  loading = false,
}: HomePlKickoffCountdownProps) {
  const t = useTranslations("home.kickoffCountdown");
  const mounted = useIsClientMounted();
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  const fixture = useMemo(
    () => selectNextPlUpcomingFixture(plFixtures, nowMs),
    [plFixtures, nowMs],
  );

  const kickoffLabel = useLocalizedKickoffLabel(fixture?.kickoffUtc ?? "");

  if (loading) {
    return null;
  }

  if (!fixture) {
    return (
      <section
        className={styles.kickoffCountdown}
        aria-label={t("ariaEmpty")}
      >
        <p className={styles.kickoffCountdownEmpty}>{t("seasonStartsSoon")}</p>
      </section>
    );
  }

  const remainingMs = new Date(fixture.kickoffUtc).getTime() - nowMs;
  const parts = splitCountdownParts(remainingMs);
  const competition = PL_LEAGUE_NAME;

  return (
    <section
      className={styles.kickoffCountdown}
      aria-live="polite"
      aria-label={t("aria", {
        home: fixture.homeTeamName,
        away: fixture.awayTeamName,
        days: parts.days,
        hours: parts.hours,
        minutes: parts.minutes,
      })}
    >
      <div className={styles.kickoffCountdownHeader}>
        <span className={styles.kickoffCountdownEyebrow}>{t("eyebrow")}</span>
        <span className={styles.kickoffCountdownComp}>{competition}</span>
      </div>

      <div className={styles.kickoffCountdownBody}>
        <div
          className={`${styles.kickoffCountdownTeam} ${styles.kickoffCountdownTeamHome}`}
        >
          <PlTeamLogo
            name={fixture.homeTeamName}
            logo={fixture.homeTeamLogo}
            size={40}
            rounded
          />
          <span className={styles.kickoffCountdownTeamName}>
            {fixture.homeTeamName}
          </span>
        </div>

        <div className={styles.kickoffCountdownCentre}>
          <div className={styles.kickoffCountdownUnits}>
            <div className={styles.kickoffCountdownUnit}>
              <span className={styles.kickoffCountdownValue}>
                {mounted ? parts.days : "–"}
              </span>
              <span className={styles.kickoffCountdownUnitLabel}>
                {t("days")}
              </span>
            </div>
            <div className={styles.kickoffCountdownUnit}>
              <span className={styles.kickoffCountdownValue}>
                {mounted ? parts.hours : "–"}
              </span>
              <span className={styles.kickoffCountdownUnitLabel}>
                {t("hours")}
              </span>
            </div>
            <div className={styles.kickoffCountdownUnit}>
              <span className={styles.kickoffCountdownValue}>
                {mounted ? parts.minutes : "–"}
              </span>
              <span className={styles.kickoffCountdownUnitLabel}>
                {t("minutes")}
              </span>
            </div>
          </div>
          <span className={styles.kickoffCountdownSub}>{t("untilKickoff")}</span>
        </div>

        <div
          className={`${styles.kickoffCountdownTeam} ${styles.kickoffCountdownTeamAway}`}
        >
          <PlTeamLogo
            name={fixture.awayTeamName}
            logo={fixture.awayTeamLogo}
            size={40}
            rounded
          />
          <span className={styles.kickoffCountdownTeamName}>
            {fixture.awayTeamName}
          </span>
        </div>
      </div>

      <div className={styles.kickoffCountdownMeta}>
        {kickoffLabel ? (
          <time
            className={styles.kickoffCountdownKickoff}
            dateTime={fixture.kickoffUtc}
          >
            {kickoffLabel}
          </time>
        ) : null}
      </div>

      <Link
        href={`/premier-league/match/${fixture.fixtureId}`}
        className={styles.kickoffCountdownLink}
      >
        {t("viewMatch")}
      </Link>
    </section>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PlTeamLogo } from "@/components/pl/PlShared";
import {
  useLocalizedKickoffLabel,
  useIsClientMounted,
} from "@/lib/client/use-local-kickoff";
import { splitCountdownParts } from "@/lib/home/pl-kickoff-countdown";
import { isCommunityShieldCountdownActive } from "@/lib/home/community-shield-countdown";
import { getCommunityShieldFixture } from "@/lib/community-shield/fixtures-ssot";
import styles from "../home-v5.module.css";

/**
 * Homepage first-slot countdown for FA Community Shield 2026.
 * Sourced from CS SSOT; self-hides more than 3 hours after kickoff.
 */
export default function HomeCommunityShieldCountdown() {
  const t = useTranslations("home.communityShieldCountdown");
  const tNav = useTranslations("nav");
  const mounted = useIsClientMounted();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const fixture = getCommunityShieldFixture();

  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  const kickoffLabel = useLocalizedKickoffLabel(fixture?.kickoffUtc ?? "");

  if (
    !fixture?.kickoffUtc ||
    !isCommunityShieldCountdownActive(fixture.kickoffUtc, nowMs)
  ) {
    return null;
  }

  const remainingMs = new Date(fixture.kickoffUtc).getTime() - nowMs;
  const parts = splitCountdownParts(remainingMs);

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
      data-gc-cs-home-countdown="true"
    >
      <div className={styles.kickoffCountdownHeader}>
        <span className={styles.kickoffCountdownEyebrow}>{t("eyebrow")}</span>
        <span className={styles.kickoffCountdownComp}>
          {tNav("communityShield")}
        </span>
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
                {mounted ? parts.days : "\u2013"}
              </span>
              <span className={styles.kickoffCountdownUnitLabel}>
                {t("days")}
              </span>
            </div>
            <div className={styles.kickoffCountdownUnit}>
              <span className={styles.kickoffCountdownValue}>
                {mounted ? parts.hours : "\u2013"}
              </span>
              <span className={styles.kickoffCountdownUnitLabel}>
                {t("hours")}
              </span>
            </div>
            <div className={styles.kickoffCountdownUnit}>
              <span className={styles.kickoffCountdownValue}>
                {mounted ? parts.minutes : "\u2013"}
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

      <Link href="/community-shield" className={styles.kickoffCountdownLink}>
        {t("viewMatch")}
      </Link>
    </section>
  );
}
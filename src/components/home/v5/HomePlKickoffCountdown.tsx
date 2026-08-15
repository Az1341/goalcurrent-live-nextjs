"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PlTeamLogo } from "@/components/pl/PlShared";
import { FavouriteMatchButton } from "@/components/FavouriteButton";
import {
  useLocalizedKickoffLabel,
  useIsClientMounted,
} from "@/lib/client/use-local-kickoff";
import { useCommunityShieldFixture } from "@/lib/client/useCommunityShieldFixture";
import { selectNextPlUpcomingFixture } from "@/lib/home/featured-selection";
import { splitCountdownParts } from "@/lib/home/pl-kickoff-countdown";
import { COMMUNITY_SHIELD_COMPETITION } from "@/lib/community-shield/constants";
import { PL_LEAGUE_NAME } from "@/lib/pl/constants";
import type { PlFixtureRow } from "@/lib/pl/types";
import styles from "../home-v5.module.css";

type HomePlKickoffCountdownProps = {
  plFixtures: readonly PlFixtureRow[];
  loading?: boolean;
};

type CountdownFixture = {
  fixtureId: number;
  kickoffUtc: string;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamName: string;
  awayTeamLogo: string | null;
  competition: string;
  href: string;
};

const COMMUNITY_SHIELD_DISPLAY_TAIL_MS = 4 * 60 * 60 * 1000;

export default function HomePlKickoffCountdown({
  plFixtures,
  loading = false,
}: HomePlKickoffCountdownProps) {
  const t = useTranslations("home.kickoffCountdown");
  const mounted = useIsClientMounted();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const { data: shieldData } = useCommunityShieldFixture();

  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  const fixture = useMemo<CountdownFixture | null>(() => {
    const shield = shieldData?.fixtures?.[0];
    if (shield?.kickoffUtc) {
      const kickoffMs = new Date(shield.kickoffUtc).getTime();
      const shieldStillPrimary =
        Number.isFinite(kickoffMs) &&
        nowMs < kickoffMs + COMMUNITY_SHIELD_DISPLAY_TAIL_MS &&
        shield.status !== "FT" &&
        shield.status !== "CANCELLED";

      if (shieldStillPrimary) {
        return {
          fixtureId: shield.fixtureId,
          kickoffUtc: shield.kickoffUtc,
          homeTeamName: shield.homeTeamName,
          homeTeamLogo: shield.homeTeamLogo,
          awayTeamName: shield.awayTeamName,
          awayTeamLogo: shield.awayTeamLogo,
          competition: COMMUNITY_SHIELD_COMPETITION,
          href: "/community-shield",
        };
      }
    }

    const pl = selectNextPlUpcomingFixture(plFixtures, nowMs);
    if (!pl) return null;
    return {
      fixtureId: pl.fixtureId,
      kickoffUtc: pl.kickoffUtc,
      homeTeamName: pl.homeTeamName,
      homeTeamLogo: pl.homeTeamLogo,
      awayTeamName: pl.awayTeamName,
      awayTeamLogo: pl.awayTeamLogo,
      competition: PL_LEAGUE_NAME,
      href: `/premier-league/match/${pl.fixtureId}`,
    };
  }, [shieldData, plFixtures, nowMs]);

  const kickoffLabel = useLocalizedKickoffLabel(fixture?.kickoffUtc ?? "");

  if (loading && !shieldData) return null;

  if (!fixture) {
    return (
      <section className={styles.kickoffCountdown} aria-label={t("ariaEmpty")}>
        <p className={styles.kickoffCountdownEmpty}>{t("seasonStartsSoon")}</p>
      </section>
    );
  }

  const remainingMs = Math.max(0, new Date(fixture.kickoffUtc).getTime() - nowMs);
  const parts = splitCountdownParts(remainingMs);
  const isCommunityShield = fixture.competition === COMMUNITY_SHIELD_COMPETITION;
  const favouriteMatchId = isCommunityShield
    ? `cs:${fixture.fixtureId}`
    : `pl:${fixture.fixtureId}`;
  const favouriteLabel = `${fixture.homeTeamName} vs ${fixture.awayTeamName}`;

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
        <span className={styles.kickoffCountdownEyebrow}>
          {isCommunityShield ? "Season curtain-raiser" : t("eyebrow")}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span className={styles.kickoffCountdownComp}>{fixture.competition}</span>
          <FavouriteMatchButton
            matchId={favouriteMatchId}
            label={favouriteLabel}
          />
        </span>
      </div>

      <div className={styles.kickoffCountdownBody}>
        <div className={`${styles.kickoffCountdownTeam} ${styles.kickoffCountdownTeamHome}`}>
          <PlTeamLogo name={fixture.homeTeamName} logo={fixture.homeTeamLogo} size={40} rounded />
          <span className={styles.kickoffCountdownTeamName}>{fixture.homeTeamName}</span>
        </div>

        <div className={styles.kickoffCountdownCentre}>
          <div className={styles.kickoffCountdownUnits}>
            <div className={styles.kickoffCountdownUnit}>
              <span className={styles.kickoffCountdownValue}>{mounted ? parts.days : "–"}</span>
              <span className={styles.kickoffCountdownUnitLabel}>{t("days")}</span>
            </div>
            <div className={styles.kickoffCountdownUnit}>
              <span className={styles.kickoffCountdownValue}>{mounted ? parts.hours : "–"}</span>
              <span className={styles.kickoffCountdownUnitLabel}>{t("hours")}</span>
            </div>
            <div className={styles.kickoffCountdownUnit}>
              <span className={styles.kickoffCountdownValue}>{mounted ? parts.minutes : "–"}</span>
              <span className={styles.kickoffCountdownUnitLabel}>{t("minutes")}</span>
            </div>
          </div>
          <span className={styles.kickoffCountdownSub}>
            {remainingMs > 0 ? t("untilKickoff") : "Match window open"}
          </span>
        </div>

        <div className={`${styles.kickoffCountdownTeam} ${styles.kickoffCountdownTeamAway}`}>
          <PlTeamLogo name={fixture.awayTeamName} logo={fixture.awayTeamLogo} size={40} rounded />
          <span className={styles.kickoffCountdownTeamName}>{fixture.awayTeamName}</span>
        </div>
      </div>

      <div className={styles.kickoffCountdownMeta}>
        {kickoffLabel ? (
          <time className={styles.kickoffCountdownKickoff} dateTime={fixture.kickoffUtc}>
            {kickoffLabel}
          </time>
        ) : null}
      </div>

      <Link href={fixture.href} className={styles.kickoffCountdownLink}>
        {isCommunityShield ? "Open match centre" : t("viewMatch")}
      </Link>
    </section>
  );
}

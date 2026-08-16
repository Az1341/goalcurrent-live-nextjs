"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PlTeamBadge } from "@/components/pl/PlShared";
import { useLiveFixtures } from "@/lib/client/useLiveFixtures";
import { useLocalizedKickoffTime } from "@/lib/client/use-local-kickoff";
import { isLocalToday } from "@/lib/date-utils";
import type { PlFixtureRow } from "@/lib/pl/types";
import styles from "./live-ribbon.module.css";

const DESKTOP_MARQUEE_LIMIT = 4;
const FIXTURES_HREF = "/premier-league/fixtures";

function fixturePriority(fixture: PlFixtureRow): number {
  if (fixture.status === "LIVE") return 0;
  if (isLocalToday(fixture.kickoffUtc)) return 1;
  if (fixture.status === "UPCOMING") return 2;
  if (fixture.status === "FT") return 3;
  return 4;
}

function sortCurrentFixtures(fixtures: readonly PlFixtureRow[]): PlFixtureRow[] {
  return [...fixtures].sort((a, b) => {
    const priority = fixturePriority(a) - fixturePriority(b);
    if (priority !== 0) return priority;
    const aTime = new Date(a.kickoffUtc).getTime();
    const bTime = new Date(b.kickoffUtc).getTime();
    if (a.status === "FT" && b.status === "FT") return bTime - aTime;
    return aTime - bTime;
  });
}

function statusClass(status: PlFixtureRow["status"]) {
  if (status === "LIVE") return styles.liveMatchStatusLive;
  if (status === "FT") return styles.liveMatchStatusFt;
  return styles.liveMatchStatusUpcoming;
}

function FixtureItem({
  fixture,
  t,
  keySuffix = "",
}: {
  fixture: PlFixtureRow;
  t: ReturnType<typeof useTranslations>;
  keySuffix?: string;
}) {
  const kickoff = useLocalizedKickoffTime(fixture.kickoffUtc);
  const hasScore =
    fixture.status === "LIVE" ||
    fixture.status === "FT" ||
    (fixture.homeScore != null && fixture.awayScore != null);
  const score = hasScore
    ? `${fixture.homeScore ?? 0}–${fixture.awayScore ?? 0}`
    : t("vs");
  const status =
    fixture.status === "LIVE"
      ? fixture.elapsed != null
        ? t("liveElapsed", { elapsed: fixture.elapsed })
        : t("live")
      : fixture.status === "FT"
        ? "FT"
        : kickoff;

  return (
    <li
      key={`${fixture.fixtureId}${keySuffix}`}
      className={styles.liveRibbonItem}
    >
      <Link
        href={`/premier-league/match/${fixture.fixtureId}`}
        className={styles.liveMatch}
        title={`${fixture.homeTeamName} ${score} ${fixture.awayTeamName}`}
      >
        <PlTeamBadge
          name={fixture.homeTeamName}
          logo={fixture.homeTeamLogo}
          size={16}
        />
        <span className={styles.liveMatchTeams}>{fixture.homeTeamName}</span>
        <span
          className={`${styles.liveMatchScore} ${statusClass(fixture.status)}`}
        >
          {score}
        </span>
        <span className={styles.liveMatchTeams}>{fixture.awayTeamName}</span>
        <PlTeamBadge
          name={fixture.awayTeamName}
          logo={fixture.awayTeamLogo}
          size={16}
        />
        <span
          className={`${styles.liveMatchStatus} ${statusClass(fixture.status)}`}
        >
          {status}
        </span>
      </Link>
    </li>
  );
}

type LiveRibbonProps = {
  embedded?: boolean;
  variant?: "default" | "v5";
};

export default function LiveRibbon({
  embedded = false,
  variant = "default",
}: LiveRibbonProps) {
  const t = useTranslations("layout.liveRibbon");
  const { data } = useLiveFixtures();
  const currentFixtures = useMemo(
    () => sortCurrentFixtures(data?.fixtures ?? []).slice(0, 8),
    [data?.fixtures],
  );

  if (currentFixtures.length === 0) return null;

  const hasLive = currentFixtures.some((fixture) => fixture.status === "LIVE");
  const desktopMatches = currentFixtures.slice(0, DESKTOP_MARQUEE_LIMIT);
  const desktopTrackMatches = [...desktopMatches, ...desktopMatches];
  const hiddenCount = Math.max(
    0,
    currentFixtures.length - DESKTOP_MARQUEE_LIMIT,
  );

  return (
    <div
      className={`${styles.liveRibbon} ${embedded ? styles.liveRibbonEmbedded : ""} ${variant === "v5" ? styles.liveRibbonV5 : ""}`}
      role="region"
      aria-label={t("tickerAria")}
    >
      <span className={styles.liveRibbonLabel}>
        {hasLive ? <span className={styles.liveDot} aria-hidden="true" /> : null}
        {hasLive ? t("liveNow") : "PREMIER LEAGUE 26/27"}
      </span>

      <div className={styles.tickerScrollMobile}>
        <ul
          className={`${styles.tickerTrack} ${styles.tickerTrackMobile} ${styles.liveRibbonList}`}
          aria-label={hasLive ? t("liveMatchesAria") : t("latestResultsAria")}
        >
          {currentFixtures.map((fixture) => (
            <FixtureItem key={fixture.fixtureId} fixture={fixture} t={t} />
          ))}
          <li className={styles.liveRibbonItem}>
            <Link
              href={FIXTURES_HREF}
              className={styles.liveRibbonMore}
              aria-label={t("viewAllFixturesAria")}
            >
              {t("allFixtures")}
            </Link>
          </li>
        </ul>
      </div>

      <div className={styles.tickerScrollDesktop}>
        <ul
          className={`${styles.tickerTrack} ${styles.tickerTrackDesktop} ${styles.liveRibbonList}`}
          aria-label={hasLive ? t("liveMatchesAria") : t("latestResultsAria")}
        >
          {desktopTrackMatches.map((fixture, index) => (
            <FixtureItem
              key={`${fixture.fixtureId}-loop-${index}`}
              fixture={fixture}
              t={t}
              keySuffix={`-loop-${index}`}
            />
          ))}
          {hiddenCount > 0 ? (
            <li className={styles.liveRibbonItem}>
              <Link
                href={FIXTURES_HREF}
                className={styles.liveRibbonMore}
                aria-label={t("viewMoreMatchesAria", { count: hiddenCount })}
              >
                {t("moreMatches", { count: hiddenCount })}
              </Link>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

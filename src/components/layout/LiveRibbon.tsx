"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TeamFlag from "@/components/TeamFlag";
import { matchHref } from "@/lib/wc26-match";
import {
  selectRibbonFixtures,
  type HomepageMatchView,
} from "@/lib/wc26-live";
import {
  formatTickerMatchTitle,
  formatTickerTeamName,
} from "@/lib/wc26-ticker-names";
import { useLocalizedKickoffTime } from "@/lib/client/use-local-kickoff";
import { useEffectiveFixtures } from "@/lib/use-effective-fixtures";
import { isWc26TournamentComplete } from "@/lib/wc26/archive";
import styles from "./live-ribbon.module.css";

const FIXTURES_HREF = isWc26TournamentComplete()
  ? "/worldcup2026"
  : "/worldcup2026/fixtures";
/** Max matches in the desktop marquee loop (matches widest breakpoint). */
const DESKTOP_MARQUEE_LIMIT = 4;

function formatScore(match: HomepageMatchView): string | null {
  if (!match.score) {
    return null;
  }
  return `${match.score.home}–${match.score.away}`;
}

function tickerStatusClass(matchClass: HomepageMatchView["matchClass"]) {
  if (matchClass === "live") return styles.liveMatchStatusLive;
  if (matchClass === "ft") return styles.liveMatchStatusFt;
  return styles.liveMatchStatusUpcoming;
}

function TickerMatchItem({
  match,
  t,
  keySuffix = "",
}: {
  match: HomepageMatchView;
  t: ReturnType<typeof useTranslations>;
  keySuffix?: string;
}) {
  const kickoffTime = useLocalizedKickoffTime(match.kickoffUtc);
  const score = formatScore(match);
  const homeName = formatTickerTeamName(match.homeTeamId, match.homeName);
  const awayName = formatTickerTeamName(match.awayTeamId, match.awayName);
  const isLive = match.matchClass === "live";
  const isFt = match.matchClass === "ft";
  const statusLabel = isLive
    ? match.elapsed != null
      ? t("liveElapsed", { elapsed: match.elapsed })
      : match.statusLabel && match.statusLabel !== "Live"
        ? match.statusLabel
        : t("live")
    : isFt
      ? match.statusLabel
      : kickoffTime;
  const matchTitle = formatTickerMatchTitle(
    match.homeName,
    match.awayName,
    score,
  );

  return (
    <li
      key={`${match.fixtureId}${keySuffix}`}
      className={styles.liveRibbonItem}
    >
      <Link
        href={matchHref(match.fixtureId)}
        className={styles.liveMatch}
        title={matchTitle}
      >
        <TeamFlag teamId={match.homeTeamId} teamName={match.homeName} size={16} />
        <span className={styles.liveMatchTeams}>{homeName}</span>
        <span
          className={`${styles.liveMatchScore} ${tickerStatusClass(match.matchClass)}`}
        >
          {score ?? (isLive ? t("live") : t("vs"))}
        </span>
        <span className={styles.liveMatchTeams}>{awayName}</span>
        <TeamFlag teamId={match.awayTeamId} teamName={match.awayName} size={16} />
        <span
          className={`${styles.liveMatchStatus} ${tickerStatusClass(match.matchClass)}`}
        >
          {statusLabel}
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
  const fixtures = useEffectiveFixtures();
  const allMatches = selectRibbonFixtures(fixtures);

  const archiveComplete = isWc26TournamentComplete();

  if (allMatches.length === 0) {
    return (
      <div
        className={`${styles.liveRibbon} ${embedded ? styles.liveRibbonEmbedded : ""} ${variant === "v5" ? styles.liveRibbonV5 : ""}`}
        role="region"
        aria-label={t("tickerAria")}
      >
        <span className={styles.liveRibbonLabel}>
          {archiveComplete ? t("archive") : t("worldCup2026")}
        </span>
        <span className={styles.liveRibbonMessage}>
          {archiveComplete ? t("emptyArchiveMessage") : t("emptyMessage")}
        </span>
      </div>
    );
  }

  const hasLive = allMatches.some((match) => match.matchClass === "live");
  const desktopMatches = allMatches.slice(0, DESKTOP_MARQUEE_LIMIT);
  const desktopTrackMatches = [...desktopMatches, ...desktopMatches];
  const hiddenCount = Math.max(0, allMatches.length - DESKTOP_MARQUEE_LIMIT);
  const ribbonModeLabel = hasLive
    ? t("liveNow")
    : archiveComplete
      ? t("archive")
      : t("latestResults");

  return (
    <div
      className={`${styles.liveRibbon} ${embedded ? styles.liveRibbonEmbedded : ""} ${variant === "v5" ? styles.liveRibbonV5 : ""}`}
      role="region"
      aria-label={t("tickerAria")}
    >
      <span className={styles.liveRibbonLabel}>
        {hasLive ? <span className={styles.liveDot} aria-hidden="true" /> : null}
        {ribbonModeLabel}
      </span>

      <div className={styles.tickerScrollMobile}>
        <ul
          className={`${styles.tickerTrack} ${styles.tickerTrackMobile} ${styles.liveRibbonList}`}
          aria-label={hasLive ? t("liveMatchesAria") : t("latestResultsAria")}
        >
          {allMatches.map((match) => (
            <TickerMatchItem key={match.fixtureId} match={match} t={t} />
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
          {desktopTrackMatches.map((match, index) => (
            <TickerMatchItem
              key={`${match.fixtureId}-loop-${index}`}
              match={match}
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

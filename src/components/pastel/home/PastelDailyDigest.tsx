"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useLiveFixtures } from "@/lib/client/useLiveFixtures";
import { useLocalizedKickoffTime } from "@/lib/client/use-local-kickoff";
import type { PlFixtureRow } from "@/lib/pl/types";
import { PlTeamLogo } from "@/components/pl/PlShared";
import styles from "../pastel.module.css";

/** Local Fri–Mon window covering a typical football weekend. */
function isLocalWeekendWindow(iso: string, now = new Date()): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;

  const day = now.getDay(); // 0 Sun … 6 Sat
  const daysSinceFriday = (day + 2) % 7;
  const friday = new Date(now);
  friday.setHours(0, 0, 0, 0);
  friday.setDate(now.getDate() - daysSinceFriday);

  const mondayEnd = new Date(friday);
  mondayEnd.setDate(friday.getDate() + 3);
  mondayEnd.setHours(23, 59, 59, 999);

  return date >= friday && date <= mondayEnd;
}

function HighlightRow({ fixture }: { fixture: PlFixtureRow }) {
  const kickoff = useLocalizedKickoffTime(fixture.kickoffUtc);
  const home = fixture.homeScore ?? 0;
  const away = fixture.awayScore ?? 0;

  return (
    <li>
      <Link
        href={`/premier-league/match/${fixture.fixtureId}`}
        className={styles.highlightRow}
      >
        <span className={styles.teamBadgeCircleSm}>
          <PlTeamLogo
            name={fixture.homeTeamName}
            logo={fixture.homeTeamLogo}
            size={22}
            rounded
            className={styles.teamBadgeInner}
          />
        </span>
        <span className={styles.highlightScore}>
          {fixture.homeTeamName} {home}–{away} {fixture.awayTeamName}
        </span>
        <span className={styles.highlightMeta}>
          {fixture.status === "FT" ? "FT" : kickoff}
        </span>
        <span className={styles.teamBadgeCircleSm}>
          <PlTeamLogo
            name={fixture.awayTeamName}
            logo={fixture.awayTeamLogo}
            size={22}
            rounded
            className={styles.teamBadgeInner}
          />
        </span>
      </Link>
    </li>
  );
}

/**
 * Weekend Highlights — real FT / in-weekend fixtures from the live PL feed.
 */
export default function PastelDailyDigest() {
  const { data, error, isLoading } = useLiveFixtures();

  const highlights = useMemo(() => {
    const fixtures = data?.fixtures ?? [];
    const weekend = fixtures.filter((f) => isLocalWeekendWindow(f.kickoffUtc));
    const preferred = weekend
      .filter((f) => f.status === "FT" || f.status === "LIVE")
      .sort(
        (a, b) =>
          new Date(b.kickoffUtc).getTime() - new Date(a.kickoffUtc).getTime(),
      );
    if (preferred.length) return preferred.slice(0, 4);

    return fixtures
      .filter((f) => f.status === "FT")
      .sort(
        (a, b) =>
          new Date(b.kickoffUtc).getTime() - new Date(a.kickoffUtc).getTime(),
      )
      .slice(0, 4);
  }, [data?.fixtures]);

  return (
    <section
      className={styles.widgetCard}
      aria-labelledby="pastel-digest-heading"
    >
      <div className={styles.widgetHeader}>
        <div>
          <p className={styles.dailyDigestEyebrow}>Daily Digest</p>
          <h2 id="pastel-digest-heading" className={styles.widgetTitle}>
            Weekend Highlights
          </h2>
        </div>
      </div>

      {isLoading && !data ? (
        <p className={styles.muted}>Loading weekend results…</p>
      ) : null}
      {error && !data ? (
        <p className={styles.muted} role="alert">
          Highlights unavailable right now.
        </p>
      ) : null}
      {!isLoading && data && highlights.length === 0 ? (
        <p className={styles.muted}>
          No finished weekend fixtures in the current Premier League feed.
        </p>
      ) : null}

      {highlights.length > 0 ? (
        <ul className={styles.highlightList}>
          {highlights.map((f) => (
            <HighlightRow key={f.fixtureId} fixture={f} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

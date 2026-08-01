"use client";

import { useMemo } from "react";
import { KickoffTime } from "@/components/KickoffTime";
import { Link } from "@/i18n/navigation";
import { useLiveFixtures } from "@/lib/client/useLiveFixtures";
import styles from "./PlLivePanel.module.css";

export default function PlLivePanel() {
  const { data, isLoading } = useLiveFixtures();
  const live = useMemo(
    () => (data?.fixtures ?? []).filter((row) => row.status === "LIVE"),
    [data],
  );
  const upcoming = useMemo(
    () =>
      (data?.fixtures ?? [])
        .filter((row) => row.status === "UPCOMING")
        .sort(
          (a, b) =>
            new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime(),
        )
        .slice(0, 6),
    [data],
  );

  if (isLoading && !data) return null;
  if (live.length === 0 && upcoming.length === 0) return null;

  return (
    <section
      className={styles.panel}
      aria-labelledby="pl-live-heading"
      data-gc-light-surface="true"
    >
      <h2 id="pl-live-heading" className={styles.heading}>
        {live.length > 0 ? (
          <>
            <span className={styles.liveDot} aria-hidden="true" />
            Premier League Live
          </>
        ) : (
          "Premier League upcoming"
        )}
      </h2>
      <ul className={styles.list}>
        {live.map((row) => (
          <li key={row.fixtureId}>
            <Link
              href={`/premier-league/match/${row.fixtureId}`}
              className={styles.row}
            >
              <span>
                {row.homeTeamName} vs {row.awayTeamName}
              </span>
              <span className={styles.score}>
                {row.homeScore ?? 0}–{row.awayScore ?? 0}
              </span>
            </Link>
          </li>
        ))}
        {live.length === 0
          ? upcoming.map((row) => (
              <li key={row.fixtureId}>
                <Link
                  href={`/premier-league/match/${row.fixtureId}`}
                  className={styles.row}
                >
                  <span>
                    {row.homeTeamName} vs {row.awayTeamName}
                  </span>
                  <span className={styles.muted}>
                    <KickoffTime utcDate={row.kickoffUtc} />
                  </span>
                </Link>
              </li>
            ))
          : null}
      </ul>
      <p className={styles.muted} style={{ marginTop: 8 }}>
        <Link href="/premier-league/fixtures">All PL fixtures</Link>
      </p>
    </section>
  );
}
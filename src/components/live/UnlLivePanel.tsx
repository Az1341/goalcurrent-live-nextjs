"use client";

import { Fragment, useMemo } from "react";
import LiveScoreAdUnit from "@/components/ads/LiveScoreAdUnit";
import { KickoffTime } from "@/components/KickoffTime";
import { Link } from "@/i18n/navigation";
import { useLiveUnlFixtures } from "@/lib/client/useLiveUnlFixtures";
import { partitionUnlFixturesForLive } from "@/lib/unl/live-partition";
import { formatUnlHostLabel } from "@/lib/unl/host-country";
import type { UnlFixtureRow } from "@/lib/unl/types";
import styles from "./UnlLivePanel.module.css";

function scoreLabel(row: UnlFixtureRow): string | null {
  if (
    row.status === "LIVE" ||
    row.status === "FT" ||
    row.status === "AET" ||
    row.status === "PEN"
  ) {
    if (row.homeScore == null || row.awayScore == null) return null;
    return `${row.homeScore}–${row.awayScore}`;
  }
  return null;
}

function FixtureRow({ row }: { row: UnlFixtureRow }) {
  const score = scoreLabel(row);
  return (
    <li>
      <Link
        href={`/nations-league/match/${row.fixtureId}`}
        className={styles.row}
      >
        <span className={styles.teams}>
          {row.homeTeamName} vs {row.awayTeamName}
        </span>
        <span className={styles.meta}>
          {score ? <span className={styles.score}>{score}</span> : null}
          <span>
            <KickoffTime utcDate={row.kickoffUtc} />
          </span>
          <span className={styles.host}>
            {formatUnlHostLabel(row.homeTeamName, row.homeTeamFlag)}
          </span>
          <span className={styles.badge}>UNL 26/27</span>
        </span>
      </Link>
    </li>
  );
}

function Bucket({
  title,
  rows,
  live,
}: {
  title: string;
  rows: UnlFixtureRow[];
  live?: boolean;
}) {
  if (rows.length === 0) return null;
  return (
    <div className={`${styles.bucket} ${live ? styles.liveBucket : ""}`}>
      <h3 className={styles.bucketTitle}>
        {live ? <span className={styles.liveDot} aria-hidden="true" /> : null}
        {title}
      </h3>
      <ul className={styles.list}>
        {rows.map((row, index) => (
          <Fragment key={row.fixtureId}>
            <FixtureRow row={row} />
            {live ? <LiveScoreAdUnit index={index + 1} /> : null}
          </Fragment>
        ))}
      </ul>
    </div>
  );
}

export default function UnlLivePanel() {
  const { data, error, isLoading } = useLiveUnlFixtures();
  const fixtures = data?.fixtures ?? [];
  const buckets = useMemo(
    () => partitionUnlFixturesForLive(fixtures),
    [fixtures],
  );

  const hasAnything =
    buckets.live.length > 0 ||
    buckets.today.length > 0 ||
    buckets.upcoming.length > 0 ||
    buckets.completed.length > 0;

  return (
    <section
      className={styles.panel}
      aria-labelledby="unl-live-heading"
      data-gc-light-surface="true"
    >
      <h2 id="unl-live-heading" className={styles.heading}>
        Nations League 26/27
      </h2>

      {isLoading && !data ? (
        <p className={styles.muted}>Loading Nations League fixtures…</p>
      ) : null}

      {error && !data ? (
        <p className={styles.muted}>Nations League fixtures unavailable.</p>
      ) : null}

      {!isLoading && !error && !hasAnything ? (
        <p className={styles.muted}>No Nations League fixtures to show.</p>
      ) : null}

      {buckets.live.length > 0 ? (
        <Bucket title="Live now" rows={buckets.live} live />
      ) : null}
      <Bucket title="Today" rows={buckets.today} />
      {buckets.upcoming.length > 0 ? (
        <Bucket title="Upcoming" rows={buckets.upcoming} />
      ) : null}
      <Bucket title="Completed" rows={buckets.completed} />
    </section>
  );
}

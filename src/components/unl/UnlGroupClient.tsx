"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { KickoffTime } from "@/components/KickoffTime";
import { Link } from "@/i18n/navigation";
import { fetcher, LIVE_SWR_OPTIONS } from "@/lib/client/fetcher";
import { LIVE_API_PATHS } from "@/lib/client/live-data";
import { useLiveUnlFixtures } from "@/lib/client/useLiveUnlFixtures";
import {
  filterUnlFixturesByGroup,
  isFinishedUnlStatus,
  isLiveUnlStatus,
  sanitiseUnlProviderError,
} from "@/lib/unl/contract";
import {
  UNL_DISPLAY_NAME,
  UNL_SEASON_LABEL,
  type UnlGroupId,
  type UnlLeagueId,
} from "@/lib/unl/constants";
import { getUnlFlagSrc } from "@/lib/unl/flag";
import { formatUnlHostLabel } from "@/lib/unl/host-country";
import { getUnlGroup } from "@/lib/unl/groups-ssot";
import type {
  UnlFixtureRow,
  UnlStandingRow,
  UnlStandingsApiResponse,
} from "@/lib/unl/types";
import styles from "./UnlHub.module.css";

type UnlGroupClientProps = {
  league: UnlLeagueId;
  groupId: UnlGroupId;
};

function statusClass(status: UnlFixtureRow["status"]): string {
  switch (status) {
    case "LIVE":
      return styles.statusLive;
    case "FT":
    case "AET":
    case "PEN":
      return styles.statusFt;
    case "POSTPONED":
      return styles.statusPostponed;
    case "CANCELLED":
      return styles.statusCancelled;
    default:
      return styles.statusUpcoming;
  }
}

function statusLabel(status: UnlFixtureRow["status"]): string {
  switch (status) {
    case "LIVE":
      return "Live";
    case "AET":
      return "AET";
    case "PEN":
      return "PEN";
    case "FT":
      return "FT";
    case "POSTPONED":
      return "Postponed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Upcoming";
  }
}

function TeamBadge({
  logo,
  flagCode,
}: {
  logo: string | null;
  flagCode: string | null;
}) {
  const src = logo || getUnlFlagSrc(flagCode);
  if (!src) return <span className={styles.badge} aria-hidden />;
  return (
    <Image
      src={src}
      alt=""
      width={22}
      height={22}
      className={styles.badge}
      unoptimized
    />
  );
}

function FixtureRow({ fixture }: { fixture: UnlFixtureRow }) {
  const showScore =
    fixture.homeScore !== null &&
    fixture.awayScore !== null &&
    (isFinishedUnlStatus(fixture.status) || isLiveUnlStatus(fixture.status));

  return (
    <article className={styles.fixtureRow}>
      <div className={styles.team}>
        <TeamBadge logo={fixture.homeTeamLogo} flagCode={fixture.homeTeamFlag} />
        <span className={styles.teamName}>{fixture.homeTeamName}</span>
      </div>
      <div className={styles.scoreBox}>
        {showScore ? (
          <>
            {fixture.homeScore} - {fixture.awayScore}
          </>
        ) : (
          "VS"
        )}
      </div>
      <div className={`${styles.team} ${styles.teamAway}`}>
        <TeamBadge logo={fixture.awayTeamLogo} flagCode={fixture.awayTeamFlag} />
        <span className={styles.teamName}>{fixture.awayTeamName}</span>
      </div>
    </article>
  );
}

function FixtureSection({
  title,
  id,
  fixtures,
  emptyTitle,
  emptyText,
}: {
  title: string;
  id: string;
  fixtures: UnlFixtureRow[];
  emptyTitle: string;
  emptyText: string;
}) {
  return (
    <section className={styles.card} aria-labelledby={id}>
      <h2 id={id} className={styles.cardTitle}>
        {title}
      </h2>
      {fixtures.length ? (
        <div className={styles.fixtureList}>
          {fixtures.map((fixture) => (
            <div key={fixture.fixtureId}>
              <div className={styles.metaLine}>
                <span className={statusClass(fixture.status)}>
                  {statusLabel(fixture.status)}
                </span>
                <span>
                  {fixture.kickoffUtc ? (
                    <KickoffTime utcDate={fixture.kickoffUtc} />
                  ) : (
                    "Kickoff TBC"
                  )}
                </span>
                {fixture.matchday ? <span>MD {fixture.matchday}</span> : null}
                <span className={styles.hostCountry}>
                  {formatUnlHostLabel(
                    fixture.homeTeamName,
                    fixture.homeTeamFlag,
                  )}
                </span>
              </div>
              <FixtureRow fixture={fixture} />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.panel}>
          <p className={styles.panelTitle}>{emptyTitle}</p>
          <p className={styles.panelText}>{emptyText}</p>
        </div>
      )}
    </section>
  );
}

function StandingsTable({ rows }: { rows: UnlStandingRow[] }) {
  if (!rows.length) {
    return (
      <div className={styles.panel}>
        <p className={styles.panelTitle}>No table yet</p>
        <p className={styles.panelText}>
          Standings appear once group matches have been played.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.standingsWrap}>
      <table className={styles.standingsTable}>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Team</th>
            <th scope="col">P</th>
            <th scope="col">W</th>
            <th scope="col">D</th>
            <th scope="col">L</th>
            <th scope="col">GD</th>
            <th scope="col">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.teamId}>
              <td>{row.rank}</td>
              <td>
                <span className={styles.standingsTeam}>
                  <TeamBadge logo={row.teamLogo} flagCode={row.teamFlag} />
                  {row.teamName}
                </span>
              </td>
              <td>{row.played}</td>
              <td>{row.win}</td>
              <td>{row.draw}</td>
              <td>{row.lose}</td>
              <td>{row.goalDiff}</td>
              <td>{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function UnlGroupClient({ league, groupId }: UnlGroupClientProps) {
  const group = getUnlGroup(groupId);
  const label = group?.label ?? `Group ${groupId.toUpperCase()}`;

  const standingsPath = `${LIVE_API_PATHS.unlStandings}?group=${encodeURIComponent(groupId)}`;
  const {
    data: standingsData,
    error: standingsError,
    isLoading: standingsLoading,
  } = useSWR<UnlStandingsApiResponse>(standingsPath, fetcher, LIVE_SWR_OPTIONS);

  const {
    data: fixturesData,
    error: fixturesError,
    isLoading: fixturesLoading,
  } = useLiveUnlFixtures();

  const groupFixtures = useMemo(
    () =>
      fixturesData?.fixtures
        ? filterUnlFixturesByGroup(fixturesData.fixtures, groupId)
        : [],
    [fixturesData, groupId],
  );

  const [nowMs] = useState(() => Date.now());
  const upcoming = useMemo(() => {
    return groupFixtures
      .filter((f) => {
        if (f.status === "UPCOMING" || isLiveUnlStatus(f.status)) return true;
        if (f.status === "POSTPONED") {
          if (!f.kickoffUtc) return true;
          return new Date(f.kickoffUtc).getTime() >= nowMs;
        }
        return false;
      })
      .sort((a, b) => {
        const at = a.kickoffUtc
          ? new Date(a.kickoffUtc).getTime()
          : Number.MAX_SAFE_INTEGER;
        const bt = b.kickoffUtc
          ? new Date(b.kickoffUtc).getTime()
          : Number.MAX_SAFE_INTEGER;
        return at - bt;
      });
  }, [groupFixtures, nowMs]);

  const results = useMemo(
    () =>
      groupFixtures
        .filter((f) => isFinishedUnlStatus(f.status))
        .sort((a, b) => {
          const at = a.kickoffUtc ? new Date(a.kickoffUtc).getTime() : 0;
          const bt = b.kickoffUtc ? new Date(b.kickoffUtc).getTime() : 0;
          return bt - at;
        }),
    [groupFixtures],
  );

  const errorMessage =
    standingsError || fixturesError
      ? sanitiseUnlProviderError("fetch failed")
      : standingsData?.error
        ? sanitiseUnlProviderError(standingsData.error)
        : fixturesData?.error
          ? sanitiseUnlProviderError(fixturesData.error)
          : null;

  return (
    <main className={styles.unlPage}>
      <Link
        href={`/nations-league/league/${league}`}
        className={styles.backLink}
      >
        ← League {league.toUpperCase()}
      </Link>
      <header className={styles.hero}>
        <p className={styles.seasonBadge}>NATIONS LEAGUE {UNL_SEASON_LABEL}</p>
        <h1 className={styles.heroTitle}>
          {UNL_DISPLAY_NAME} · {label}
        </h1>
        <p className={styles.heroSub}>
          Table, fixtures and results for {label} in local kickoff times.
        </p>
      </header>

      {standingsLoading || fixturesLoading ? (
        <div className={styles.panel} role="status">
          <p className={styles.panelTitle}>Loading {label}</p>
          <p className={styles.panelText}>Fetching table and fixtures…</p>
        </div>
      ) : null}

      {errorMessage ? (
        <div className={`${styles.panel} ${styles.errorPanel}`} role="alert">
          <p className={styles.panelTitle}>Could not load group</p>
          <p className={styles.panelText}>{errorMessage}</p>
        </div>
      ) : null}

      <div className={styles.stack}>
        <section className={styles.card} aria-labelledby="unl-group-table">
          <h2 id="unl-group-table" className={styles.cardTitle}>
            Table
          </h2>
          <StandingsTable rows={standingsData?.standings ?? []} />
        </section>

        <FixtureSection
          title="Fixtures"
          id="unl-group-fixtures"
          fixtures={upcoming}
          emptyTitle="No upcoming fixtures"
          emptyText={`Scheduled ${label} matches will appear here.`}
        />

        <FixtureSection
          title="Results"
          id="unl-group-results"
          fixtures={results}
          emptyTitle="No results yet"
          emptyText={`Finished ${label} matches will appear here.`}
        />
      </div>
    </main>
  );
}
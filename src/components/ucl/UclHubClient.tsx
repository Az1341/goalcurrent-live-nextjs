"use client";

import Image from "next/image";
import { useMemo } from "react";
import useSWR from "swr";
import { fetcher, LIVE_SWR_OPTIONS } from "@/lib/client/fetcher";
import { useLiveUclFixtures } from "@/lib/client/useLiveUclFixtures";
import { SITE_NAME } from "@/lib/site-url";
import {
  isFinishedUclStatus,
  isLiveUclStatus,
  sanitiseUclProviderError,
} from "@/lib/ucl/contract";
import {
  UCL_DISPLAY_NAME,
  UCL_SEASON_LABEL,
  UCL_LEAGUE_ID,
  UCL_SEASON,
} from "@/lib/ucl/constants";
import type {
  UclFixtureRow,
  UclStandingsApiResponse,
} from "@/lib/ucl/types";
import styles from "./UclHub.module.css";

function formatKickoff(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status: UclFixtureRow["status"]): string {
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

function statusLabel(status: UclFixtureRow["status"]): string {
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

function pickUpcoming(fixtures: UclFixtureRow[]): UclFixtureRow[] {
  const now = Date.now();
  return fixtures
    .filter(
      (f) =>
        f.status === "UPCOMING" ||
        isLiveUclStatus(f.status) ||
        (f.status === "POSTPONED" && new Date(f.kickoffUtc).getTime() >= now),
    )
    .sort(
      (a, b) =>
        new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime(),
    )
    .slice(0, 8);
}

function pickResults(fixtures: UclFixtureRow[]): UclFixtureRow[] {
  return fixtures
    .filter((f) => isFinishedUclStatus(f.status))
    .sort(
      (a, b) =>
        new Date(b.kickoffUtc).getTime() - new Date(a.kickoffUtc).getTime(),
    )
    .slice(0, 8);
}

function TeamBadge({ logo }: { name: string; logo: string | null }) {
  if (!logo) {
    return <span className={styles.badge} aria-hidden />;
  }
  return (
    <Image
      src={logo}
      alt=""
      width={22}
      height={22}
      className={styles.badge}
      unoptimized
    />
  );
}

function FixtureRow({ fixture }: { fixture: UclFixtureRow }) {
  const showScore =
    fixture.homeScore !== null &&
    fixture.awayScore !== null &&
    (isFinishedUclStatus(fixture.status) || isLiveUclStatus(fixture.status));

  return (
    <article className={styles.fixtureRow}>
      <div className={styles.team}>
        <TeamBadge name={fixture.homeTeamName} logo={fixture.homeTeamLogo} />
        <span className={styles.teamName}>{fixture.homeTeamName}</span>
      </div>
      <div className={styles.scoreBox}>
        {showScore ? (
          <>
            {fixture.homeScore} - {fixture.awayScore}
            {fixture.status === "PEN" &&
            fixture.penaltyHome !== null &&
            fixture.penaltyAway !== null ? (
              <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                ({fixture.penaltyHome}-{fixture.penaltyAway} p)
              </div>
            ) : null}
          </>
        ) : (
          "VS"
        )}
      </div>
      <div className={`${styles.team} ${styles.teamAway}`}>
        <TeamBadge name={fixture.awayTeamName} logo={fixture.awayTeamLogo} />
        <span className={styles.teamName}>{fixture.awayTeamName}</span>
      </div>
    </article>
  );
}

function FixtureBlock({
  title,
  id,
  fixtures,
  emptyTitle,
  emptyText,
}: {
  title: string;
  id: string;
  fixtures: UclFixtureRow[];
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
                <span>{formatKickoff(fixture.kickoffUtc)}</span>
                {fixture.round ? <span>{fixture.round}</span> : null}
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

export default function UclHubClient() {
  const {
    data: fixturesData,
    error: fixturesError,
    isLoading: fixturesLoading,
  } = useLiveUclFixtures();

  const {
    data: standingsData,
    error: standingsError,
    isLoading: standingsLoading,
  } = useSWR<UclStandingsApiResponse>(
    "/api/ucl/standings",
    fetcher,
    LIVE_SWR_OPTIONS,
  );

  const upcoming = useMemo(
    () => (fixturesData?.fixtures ? pickUpcoming(fixturesData.fixtures) : []),
    [fixturesData],
  );
  const results = useMemo(
    () => (fixturesData?.fixtures ? pickResults(fixturesData.fixtures) : []),
    [fixturesData],
  );

  const tableRows = useMemo(() => {
    if (!standingsData?.standingsAvailable) return [];
    return standingsData.standings.slice(0, 10);
  }, [standingsData]);

  const isLoading = fixturesLoading || standingsLoading;
  const errorMessage =
    fixturesError || standingsError
      ? sanitiseUclProviderError("fetch failed")
      : fixturesData?.error
        ? sanitiseUclProviderError(fixturesData.error)
        : standingsData?.error
          ? sanitiseUclProviderError(standingsData.error)
          : null;

  const stale = Boolean(fixturesData?.stale || standingsData?.stale);
  const ownershipOk =
    !fixturesData ||
    (fixturesData.competitionKey === "ucl" &&
      fixturesData.leagueId === UCL_LEAGUE_ID &&
      fixturesData.season === UCL_SEASON);

  return (
    <main className={styles.uclPage}>
      <header className={styles.hero}>
        <p className={styles.seasonBadge}>CHAMPIONS LEAGUE {UCL_SEASON_LABEL}</p>
        <h1 className={styles.heroTitle}>{UCL_DISPLAY_NAME}</h1>
        <p className={styles.heroSub}>
          UEFA Champions League {UCL_SEASON_LABEL} on {SITE_NAME} — league-phase
          fixtures, results and standings for Europe&apos;s top club competition.
        </p>
        <nav className={styles.hubNav} aria-label="Champions League 26/27 sections">
          <a href="#ucl-fixtures">Fixtures</a>
          <a href="#ucl-results">Results</a>
          <a href="#ucl-standings">Standings</a>
        </nav>
      </header>

      {isLoading ? (
        <div className={styles.panel} role="status">
          <p className={styles.panelTitle}>Loading Champions League</p>
          <p className={styles.panelText}>Fetching fixtures and standings…</p>
        </div>
      ) : null}

      {errorMessage ? (
        <div className={`${styles.panel} ${styles.errorPanel}`} role="alert" data-testid="ucl-hub-error">
          <p className={styles.panelTitle}>Could not load hub</p>
          <p className={styles.panelText}>{errorMessage}</p>
        </div>
      ) : null}

      {stale ? (
        <p className={styles.staleNote}>
          Showing recently cached Champions League data while the live feed
          recovers.
        </p>
      ) : null}

      {!isLoading && ownershipOk && fixturesData ? (
        <div className={styles.stack}>
          <FixtureBlock
            title="Fixtures"
            id="ucl-fixtures"
            fixtures={upcoming}
            emptyTitle="No upcoming fixtures"
            emptyText={
              fixturesData.configured
                ? "Scheduled Champions League matches will appear here."
                : "Fixtures appear when API-Football is configured on the server."
            }
          />
          <FixtureBlock
            title="Recent results"
            id="ucl-results"
            fixtures={results}
            emptyTitle="No results yet"
            emptyText="Finished Champions League matches will appear here."
          />
          <section className={styles.card} aria-labelledby="ucl-standings">
            <h2 id="ucl-standings" className={styles.cardTitle}>
              Standings
            </h2>
            {standingsData?.standingsAvailable && tableRows.length ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Club</th>
                      <th scope="col">P</th>
                      <th scope="col" className={styles.colPts}>
                        Pts
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr key={`${row.group ?? "t"}-${row.teamId}`}>
                        <td>{row.rank}</td>
                        <td>
                          <div className={styles.team}>
                            <TeamBadge
                              name={row.teamName}
                              logo={row.teamLogo}
                            />
                            <span className={styles.teamName}>
                              {row.teamName}
                            </span>
                          </div>
                        </td>
                        <td>{row.played}</td>
                        <td className={styles.colPts}>{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.panel}>
                <p className={styles.panelTitle}>Standings unavailable</p>
                <p className={styles.panelText}>
                  A Champions League table is shown only when the provider returns
                  a reliable league-phase standing. Qualification and knockout
                  rounds are not forced into a Premier League-style table.
                </p>
              </div>
            )}
          </section>
          <p className={styles.footerMeta}>
            Data ownership: UCL league {UCL_LEAGUE_ID} / season {UCL_SEASON}.
            Match-centre deep links are deferred until ownership routes ship.
          </p>
        </div>
      ) : null}

      {!isLoading && fixturesData && !ownershipOk ? (
        <div className={`${styles.panel} ${styles.errorPanel}`} role="alert">
          <p className={styles.panelTitle}>Ownership mismatch</p>
          <p className={styles.panelText}>
            Rejected a response that was not Champions League {UCL_LEAGUE_ID}/
            {UCL_SEASON}.
          </p>
        </div>
      ) : null}
    </main>
  );
}
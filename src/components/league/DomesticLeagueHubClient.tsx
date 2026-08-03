"use client";

import { useMemo } from "react";
import useSWR from "swr";
import PlFixtureCard from "@/components/pl/PlFixtureCard";
import type { PlFixtureRow, PlStandingRow } from "@/lib/pl/types";
import {
  isPreseasonStandings,
  resolveDisplayStandings,
} from "@/lib/pl/standings-display";
import type {
  DomesticLeagueFixturesResponse,
  DomesticLeagueStandingsResponse,
} from "@/lib/domestic-league/types";
import { SITE_NAME } from "@/lib/site-url";
import { fetcher, LIVE_SWR_OPTIONS } from "@/lib/client/fetcher";
import styles from "@/components/pl/PlData.module.css";
import tableStyles from "@/components/pl/PlTable.module.css";
import {
  PlEmptyPanel,
  PlErrorPanel,
  PlTeamBadge,
} from "@/components/pl/PlShared";

export type DomesticLeagueHubConfig = {
  displayName: string;
  seasonLabel: string;
  competitionLabel: string;
  fixturesApiPath: string;
  standingsApiPath: string;
};

function findNextFixture(fixtures: PlFixtureRow[]): PlFixtureRow | null {
  const now = Date.now();
  const upcoming = fixtures
    .filter((f) => f.status === "UPCOMING" && new Date(f.kickoffUtc).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime(),
    );
  if (upcoming.length) return upcoming[0];
  const live = fixtures.filter((f) => f.status === "LIVE");
  if (live.length) return live[0];
  return null;
}

function findLatestResult(fixtures: PlFixtureRow[]): PlFixtureRow | null {
  const finished = fixtures
    .filter((f) => f.status === "FT")
    .sort(
      (a, b) =>
        new Date(b.kickoffUtc).getTime() - new Date(a.kickoffUtc).getTime(),
    );
  return finished[0] ?? null;
}

function HubStandingRow({ row }: { row: PlStandingRow }) {
  return (
    <tr>
      <td className={tableStyles.colRank}>{row.rank}</td>
      <td className={tableStyles.colClub}>
        <div className={tableStyles.clubCell}>
          <PlTeamBadge name={row.teamName} logo={row.teamLogo} size={22} />
          <span className={tableStyles.clubName}>{row.teamName}</span>
        </div>
      </td>
      <td>{row.played}</td>
      <td className={tableStyles.colPts}>{row.points}</td>
    </tr>
  );
}

function buildStandingsFromFixtures(
  fixtures: PlFixtureRow[],
): PlStandingRow[] {
  const teams = new Map<
    number,
    { id: number; name: string; logo: string | null }
  >();
  for (const fixture of fixtures) {
    teams.set(fixture.homeTeamId, {
      id: fixture.homeTeamId,
      name: fixture.homeTeamName,
      logo: fixture.homeTeamLogo,
    });
    teams.set(fixture.awayTeamId, {
      id: fixture.awayTeamId,
      name: fixture.awayTeamName,
      logo: fixture.awayTeamLogo,
    });
  }
  return [...teams.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((team, index) => ({
      rank: index + 1,
      teamId: team.id,
      teamName: team.name,
      teamLogo: team.logo,
      played: 0,
      win: 0,
      draw: 0,
      lose: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
      form: null,
      status: null,
      description: null,
    }));
}

function unconfiguredMessage(leagueName: string): string {
  return `${leagueName} data will appear when the API key is configured on the server.`;
}

function seasonNotStartedMessage(
  leagueName: string,
  seasonLabel: string,
): string {
  return `${leagueName} ${seasonLabel} fixtures and standings are not yet available from API-Football.`;
}

function resolveApiErrorMessage(
  fixtures: DomesticLeagueFixturesResponse,
  standings: DomesticLeagueStandingsResponse,
): string | null {
  return fixtures.error ?? standings.error ?? null;
}

export default function DomesticLeagueHubClient({
  config,
  initialFixtures,
  initialStandings,
}: {
  config: DomesticLeagueHubConfig;
  initialFixtures: DomesticLeagueFixturesResponse;
  initialStandings: DomesticLeagueStandingsResponse;
}) {
  const { data: fixturesData, error: fixturesError } =
    useSWR<DomesticLeagueFixturesResponse>(
      config.fixturesApiPath,
      fetcher,
      {
        ...LIVE_SWR_OPTIONS,
        fallbackData: initialFixtures,
        revalidateOnMount: false,
      },
    );

  const { data: standingsData, error: standingsError } =
    useSWR<DomesticLeagueStandingsResponse>(
      config.standingsApiPath,
      fetcher,
      {
        ...LIVE_SWR_OPTIONS,
        fallbackData: initialStandings,
        revalidateOnMount: false,
      },
    );

  const resolvedFixtures = fixturesData ?? initialFixtures;
  const resolvedStandings = standingsData ?? initialStandings;
  const hasRefreshError = Boolean(fixturesError || standingsError);

  const nextFixture = useMemo(
    () =>
      resolvedFixtures.fixtures.length
        ? findNextFixture(resolvedFixtures.fixtures)
        : null,
    [resolvedFixtures],
  );

  const latestResult = useMemo(
    () =>
      resolvedFixtures.fixtures.length
        ? findLatestResult(resolvedFixtures.fixtures)
        : null,
    [resolvedFixtures],
  );

  const tableSnapshot = useMemo(() => {
    let standings = resolvedStandings.standings;
    if (!standings.length && resolvedFixtures.fixtures.length) {
      standings = buildStandingsFromFixtures(resolvedFixtures.fixtures);
    }
    if (!standings.length) return [];
    return resolveDisplayStandings(standings).slice(0, 6);
  }, [resolvedStandings, resolvedFixtures]);

  const updatedAtLabel = useMemo(() => {
    const iso = resolvedFixtures.fetchedAt ?? resolvedStandings.fetchedAt;
    if (!iso) return "—";
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [resolvedFixtures, resolvedStandings]);

  const preseasonTable =
    tableSnapshot.length > 0 && isPreseasonStandings(tableSnapshot);

  const configured =
    resolvedFixtures.configured !== false ||
    resolvedStandings.configured !== false;

  const hasAnyData =
    resolvedFixtures.fixtures.length > 0 || resolvedStandings.standings.length > 0;

  const apiErrorMessage = resolveApiErrorMessage(
    resolvedFixtures,
    resolvedStandings,
  );

  const emptyStateText = !configured
    ? unconfiguredMessage(config.displayName)
    : seasonNotStartedMessage(config.displayName, config.seasonLabel);

  return (
    <main className={styles.plPage}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>{config.displayName}</h1>
        <p className={styles.heroSub}>
          Your {SITE_NAME} hub — fixtures and table from official API-Football
          data for {config.seasonLabel}.
        </p>
      </header>

      {hasRefreshError ? (
        <PlErrorPanel
          title="Could not refresh hub"
          text={`${config.displayName} data could not be refreshed. Showing the last server-rendered snapshot.`}
        />
      ) : null}

      {apiErrorMessage ? (
        <PlErrorPanel
          title="Live data temporarily unavailable"
          text={apiErrorMessage}
        />
      ) : null}

      {!hasAnyData && !apiErrorMessage ? (
        <PlEmptyPanel
          title="Season data not yet available"
          text={emptyStateText}
        />
      ) : hasAnyData ? (
        <div className={styles.hubGrid}>
          <section className={styles.hubCard} aria-labelledby="league-next-fixture">
            <h2 id="league-next-fixture" className={styles.hubCardTitle}>
              Next fixture
            </h2>
            {nextFixture ? (
              <PlFixtureCard
                fixture={nextFixture}
                competition={config.competitionLabel}
                matchBasePath={null}
              />
            ) : (
              <PlEmptyPanel
                title="No upcoming fixtures"
                text="The next match will appear here when scheduled in API-Football."
              />
            )}
          </section>

          <section className={styles.hubCard} aria-labelledby="league-latest-result">
            <h2 id="league-latest-result" className={styles.hubCardTitle}>
              Latest result
            </h2>
            {latestResult ? (
              <PlFixtureCard
                fixture={latestResult}
                competition={config.competitionLabel}
                matchBasePath={null}
              />
            ) : (
              <PlEmptyPanel
                title="No results yet"
                text="Completed matches will appear here once the season begins."
              />
            )}
          </section>

          <section
            className={`${styles.hubCard} ${styles.hubCardWide}`}
            aria-labelledby="league-table-snapshot"
          >
            <h2 id="league-table-snapshot" className={styles.hubCardTitle}>
              Table snapshot
            </h2>
            {tableSnapshot.length ? (
              <>
                {preseasonTable ? (
                  <p className={styles.hubNote}>
                    Pre-season — alphabetical order until matches begin.
                  </p>
                ) : null}
                <div className={tableStyles.tableWrap}>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col" className={tableStyles.colClub}>
                          Club
                        </th>
                        <th scope="col">P</th>
                        <th scope="col" className={tableStyles.colPts}>
                          Pts
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableSnapshot.map((row) => (
                        <HubStandingRow key={row.teamId} row={row} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <PlEmptyPanel
                title="Standings not yet available"
                text={
                  apiErrorMessage ??
                  seasonNotStartedMessage(config.displayName, config.seasonLabel)
                }
              />
            )}
          </section>
        </div>
      ) : null}

      <p className={styles.meta}>
        Data from API-Football · Updated {updatedAtLabel}
      </p>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { PlTeamLogo } from "@/components/pl/PlShared";
import type {
  PlFixtureRow,
  PlFixturesApiResponse,
  PlStandingRow,
  PlStandingsApiResponse,
  PlTeamsApiResponse,
} from "@/lib/pl/types";
import {
  buildZeroStandingsFromTeams,
  isPreseasonStandings,
  resolveDisplayStandings,
} from "@/lib/pl/standings-display";
import { SITE_NAME } from "@/lib/site-url";
import styles from "./PlTable.module.css";

type ViewState = "loading" | "error" | "ready";

type PlTableClientProps = {
  initialData?: PlStandingsApiResponse;
};

function formatGoalDiff(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function zoneClass(rank: number, total: number): string | undefined {
  if (rank <= 4) return styles.zoneUcl;
  if (rank === 5) return styles.zoneEl;
  if (rank <= 7) return styles.zoneConf;
  if (rank > total - 3) return styles.zoneRel;
  return undefined;
}

function extractTeamsFromFixtures(
  fixtures: PlFixtureRow[],
): Array<{ id: number; name: string; logo: string | null }> {
  const teams = new Map<number, { id: number; name: string; logo: string | null }>();

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

  return [...teams.values()];
}

function StandingRow({
  row,
  totalTeams,
}: {
  row: PlStandingRow;
  totalTeams: number;
}) {
  const zone = zoneClass(row.rank, totalTeams);
  const gdClass =
    row.goalDiff > 0
      ? styles.gdPos
      : row.goalDiff < 0
        ? styles.gdNeg
        : undefined;

  return (
    <tr>
      <td className={styles.colRank}>{row.rank}</td>
      <td className={styles.colClub}>
        <div className={styles.clubCell}>
          <span
            className={`${styles.zoneBar} ${zone ?? ""}`}
            aria-hidden="true"
          />
          <PlTeamLogo
            name={row.teamName}
            logo={row.teamLogo}
            size={22}
            className={styles.badge}
          />
          <span className={styles.clubName}>{row.teamName}</span>
        </div>
      </td>
      <td>{row.played}</td>
      <td className={styles.hideSm}>{row.win}</td>
      <td className={styles.hideSm}>{row.draw}</td>
      <td className={styles.hideSm}>{row.lose}</td>
      <td className={gdClass}>{formatGoalDiff(row.goalDiff)}</td>
      <td className={styles.colPts}>{row.points}</td>
    </tr>
  );
}

export default function PlTableClient({ initialData }: PlTableClientProps) {
  const initialHasRows = Boolean(initialData?.standings?.length);
  const [view, setView] = useState<ViewState>(initialHasRows ? "ready" : "loading");
  const [data, setData] = useState<PlStandingsApiResponse | null>(initialData ?? null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStandings() {
      if (!initialHasRows) setView("loading");
      setErrorMessage(null);

      try {
        const res = await fetch("/api/pl/standings", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }

        let body = (await res.json()) as PlStandingsApiResponse;
        if (cancelled) return;

        if (!body.standings.length) {
          const teamsRes = await fetch("/api/pl/teams", { cache: "no-store" });
          if (teamsRes.ok) {
            const teamsBody = (await teamsRes.json()) as PlTeamsApiResponse;
            if (teamsBody.teams.length) {
              body = {
                ...body,
                standings: buildZeroStandingsFromTeams(
                  teamsBody.teams.map((team) => ({
                    id: team.teamId,
                    name: team.name,
                    logo: team.logo,
                  })),
                ),
                error: undefined,
                source: "api-football",
              };
            }
          }

          if (!body.standings.length) {
            const fixturesRes = await fetch("/api/pl/fixtures", {
              cache: "no-store",
            });
            if (fixturesRes.ok) {
              const fixturesBody =
                (await fixturesRes.json()) as PlFixturesApiResponse;
              const teams = extractTeamsFromFixtures(fixturesBody.fixtures);
              if (teams.length) {
                body = {
                  ...body,
                  standings: buildZeroStandingsFromTeams(teams),
                  error: undefined,
                  source: "api-football",
                };
              }
            }
          }
        }

        if (cancelled) return;
        if (body.standings.length) {
          setData(body);
          setView("ready");
        } else if (!initialHasRows) {
          setData(body);
          setView("ready");
        }
      } catch (error) {
        if (cancelled) return;
        if (initialHasRows) {
          setView("ready");
          return;
        }
        setData(null);
        setErrorMessage(
          error instanceof Error ? error.message : "Unknown error",
        );
        setView("error");
      }
    }

    void loadStandings();
    return () => {
      cancelled = true;
    };
  }, [initialHasRows]);

  const displayStandings = useMemo(
    () => (data?.standings ? resolveDisplayStandings(data.standings) : []),
    [data],
  );

  const preseasonTable =
    displayStandings.length > 0 && isPreseasonStandings(displayStandings);

  return (
    <main className={styles.plPage}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Premier League Table 2026/27</h1>
        <p className={styles.heroSub}>
          Live standings on {SITE_NAME} — updated from official data when
          available.
        </p>
      </header>

      {view === "loading" ? (
        <div className={styles.panel} role="status" aria-live="polite">
          <div className={styles.spinner} aria-hidden="true" />
          <p className={styles.panelTitle}>Loading standings</p>
          <p className={styles.panelText}>Fetching Premier League table…</p>
        </div>
      ) : null}

      {view === "error" ? (
        <div className={styles.panel} role="alert">
          <p className={styles.panelTitle}>Could not load table</p>
          <p className={styles.panelText}>
            {errorMessage ??
              "The standings API is temporarily unavailable. Please try again shortly."}
          </p>
        </div>
      ) : null}

      {view === "ready" && data && displayStandings.length > 0 ? (
        <>
          {preseasonTable ? (
            <p className={styles.preseasonNote} role="note">
              Pre-season table — clubs listed alphabetically with zero stats until
              matches begin.
            </p>
          ) : null}

          <div className={styles.legend} aria-label="Table zone legend">
            <span className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.zoneUcl}`} />
              CL
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.zoneEl}`} />
              EL
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.zoneConf}`} />
              Conf
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.zoneRel}`} />
              Rel
            </span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col" className={styles.colClub}>
                    Club
                  </th>
                  <th scope="col">P</th>
                  <th scope="col" className={styles.hideSm}>
                    W
                  </th>
                  <th scope="col" className={styles.hideSm}>
                    D
                  </th>
                  <th scope="col" className={styles.hideSm}>
                    L
                  </th>
                  <th scope="col">GD</th>
                  <th scope="col" className={styles.colPts}>
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayStandings.map((row) => (
                  <StandingRow
                    key={`${row.teamId}-${row.rank}`}
                    row={row}
                    totalTeams={displayStandings.length}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <p className={styles.meta}>
            Source: {data.source} · Updated{" "}
            {new Date(data.fetchedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </>
      ) : null}
    </main>
  );
}

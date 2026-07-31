"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useLiveFacupFixtures } from "@/lib/client/useLiveFacupFixtures";
import { SITE_NAME } from "@/lib/site-url";
import {
  groupFacupFixturesByRound,
  isFinishedFacupStatus,
  isLiveFacupStatus,
  sanitiseFacupProviderError,
} from "@/lib/facup/contract";
import {
  FACUP_DISPLAY_NAME,
  FACUP_LEAGUE_ID,
  FACUP_SEASON,
} from "@/lib/facup/constants";
import type { FacupFixtureRow } from "@/lib/facup/types";
import styles from "./FacupHub.module.css";

function formatKickoff(iso: string | null): string {
  if (!iso) return "Kickoff TBC";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Kickoff TBC";
  return date.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status: FacupFixtureRow["status"]): string {
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
    case "ABANDONED":
      return styles.statusAbandoned;
    default:
      return styles.statusUpcoming;
  }
}

function statusLabel(status: FacupFixtureRow["status"]): string {
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
    case "ABANDONED":
      return "Abandoned";
    default:
      return "Upcoming";
  }
}

function pickUpcoming(fixtures: FacupFixtureRow[]): FacupFixtureRow[] {
  const now = Date.now();
  return fixtures
    .filter((f) => {
      if (f.status === "UPCOMING" || isLiveFacupStatus(f.status)) return true;
      if (f.status === "POSTPONED") {
        if (!f.kickoffUtc) return true;
        return new Date(f.kickoffUtc).getTime() >= now;
      }
      return false;
    })
    .sort((a, b) => {
      const at = a.kickoffUtc ? new Date(a.kickoffUtc).getTime() : Number.MAX_SAFE_INTEGER;
      const bt = b.kickoffUtc ? new Date(b.kickoffUtc).getTime() : Number.MAX_SAFE_INTEGER;
      return at - bt;
    })
    .slice(0, 8);
}

function pickResults(fixtures: FacupFixtureRow[]): FacupFixtureRow[] {
  return fixtures
    .filter((f) => isFinishedFacupStatus(f.status))
    .sort((a, b) => {
      const at = a.kickoffUtc ? new Date(a.kickoffUtc).getTime() : 0;
      const bt = b.kickoffUtc ? new Date(b.kickoffUtc).getTime() : 0;
      return bt - at;
    })
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

function FixtureRow({ fixture }: { fixture: FacupFixtureRow }) {
  const showScore =
    fixture.homeScore !== null &&
    fixture.awayScore !== null &&
    (isFinishedFacupStatus(fixture.status) || isLiveFacupStatus(fixture.status));

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
              <div className={styles.penaltyNote}>
                ({fixture.penaltyHome}-{fixture.penaltyAway} p)
              </div>
            ) : null}
            {fixture.status === "AET" ? (
              <div className={styles.penaltyNote}>after extra time</div>
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
  fixtures: FacupFixtureRow[];
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
                {fixture.roundLabel ? <span>{fixture.roundLabel}</span> : null}
                {fixture.isReplay ? <span>Replay</span> : null}
              </div>
              <FixtureRow fixture={fixture} />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.panel} data-testid={`facup-empty-${id}`}>
          <p className={styles.panelTitle}>{emptyTitle}</p>
          <p className={styles.panelText}>{emptyText}</p>
        </div>
      )}
    </section>
  );
}

export default function FacupHubClient() {
  const {
    data: fixturesData,
    error: fixturesError,
    isLoading: fixturesLoading,
  } = useLiveFacupFixtures();

  const upcoming = useMemo(
    () => (fixturesData?.fixtures ? pickUpcoming(fixturesData.fixtures) : []),
    [fixturesData],
  );
  const results = useMemo(
    () => (fixturesData?.fixtures ? pickResults(fixturesData.fixtures) : []),
    [fixturesData],
  );
  const roundGroups = useMemo(
    () =>
      fixturesData?.fixtures
        ? groupFacupFixturesByRound(fixturesData.fixtures)
        : [],
    [fixturesData],
  );

  const isLoading = fixturesLoading;
  const errorMessage = fixturesError
    ? sanitiseFacupProviderError("fetch failed")
    : fixturesData?.error
      ? sanitiseFacupProviderError(fixturesData.error)
      : null;

  const stale = Boolean(fixturesData?.stale);
  const ownershipOk =
    !fixturesData ||
    (fixturesData.competitionKey === "facup" &&
      fixturesData.leagueId === FACUP_LEAGUE_ID &&
      fixturesData.season === FACUP_SEASON &&
      fixturesData.standingsSupported === false);

  return (
    <main className={styles.facupPage}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>{FACUP_DISPLAY_NAME}</h1>
        <p className={styles.heroSub}>
          {SITE_NAME} private-preview hub — FA Cup fixtures and results by round.
          Standings are not shown for this knockout competition.
        </p>
      </header>

      {isLoading ? (
        <div className={styles.panel} role="status" data-testid="facup-hub-loading">
          <p className={styles.panelTitle}>Loading FA Cup</p>
          <p className={styles.panelText}>Fetching fixtures and results…</p>
        </div>
      ) : null}

      {errorMessage ? (
        <div
          className={`${styles.panel} ${styles.errorPanel}`}
          role="alert"
          data-testid="facup-hub-error"
        >
          <p className={styles.panelTitle}>Could not load hub</p>
          <p className={styles.panelText}>{errorMessage}</p>
        </div>
      ) : null}

      {stale ? (
        <p className={styles.staleNote} data-testid="facup-hub-stale">
          Showing recently cached FA Cup data while the live feed recovers.
        </p>
      ) : null}

      {!isLoading && ownershipOk && fixturesData ? (
        <div className={styles.stack}>
          <FixtureBlock
            title="Upcoming fixtures"
            id="facup-fixtures"
            fixtures={upcoming}
            emptyTitle="No upcoming fixtures"
            emptyText={
              fixturesData.configured
                ? "Scheduled FA Cup matches will appear here."
                : "Fixtures appear when API-Football is configured on the server."
            }
          />
          <FixtureBlock
            title="Recent results"
            id="facup-results"
            fixtures={results}
            emptyTitle="No results yet"
            emptyText="Finished FA Cup matches will appear here."
          />
          <section className={styles.card} aria-labelledby="facup-rounds">
            <h2 id="facup-rounds" className={styles.cardTitle}>
              By round
            </h2>
            {roundGroups.length ? (
              roundGroups.map((group) => (
                <div key={`${group.roundKind}:${group.roundLabel}`}>
                  <h3 className={styles.roundLabel}>{group.roundLabel}</h3>
                  <div className={styles.fixtureList}>
                    {group.fixtures.map((fixture) => (
                      <div key={`round-${fixture.fixtureId}`}>
                        <div className={styles.metaLine}>
                          <span className={statusClass(fixture.status)}>
                            {statusLabel(fixture.status)}
                          </span>
                          <span>{formatKickoff(fixture.kickoffUtc)}</span>
                        </div>
                        <FixtureRow fixture={fixture} />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.panel} data-testid="facup-empty-rounds">
                <p className={styles.panelTitle}>No round data yet</p>
                <p className={styles.panelText}>
                  Round groupings appear when FA Cup fixtures are available.
                </p>
              </div>
            )}
          </section>
          <p className={styles.footerMeta}>
            Data ownership: FA Cup league {FACUP_LEAGUE_ID} / season {FACUP_SEASON}.
            Standings unsupported. Thin round and match pages are deferred.
          </p>
        </div>
      ) : null}

      {!isLoading && fixturesData && !ownershipOk ? (
        <div
          className={`${styles.panel} ${styles.errorPanel}`}
          role="alert"
          data-testid="facup-hub-ownership"
        >
          <p className={styles.panelTitle}>Ownership mismatch</p>
          <p className={styles.panelText}>
            Rejected a response that was not FA Cup {FACUP_LEAGUE_ID}/{FACUP_SEASON}.
          </p>
        </div>
      ) : null}
    </main>
  );
}
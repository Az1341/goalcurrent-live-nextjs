"use client";

import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  buildGoogleCalendarUrl,
  downloadIcsFile,
  type CalendarEventInput,
} from "@/lib/calendar";
import type { PlMatchApiResponse } from "@/lib/pl/types";
import { absoluteUrl, SITE_NAME } from "@/lib/site-url";
import { fetcher, LIVE_MATCH_SWR_OPTIONS } from "@/lib/client/fetcher";
import LiveMatchDashboard from "@/components/match/LiveMatchDashboard";
import styles from "./PlMatch.module.css";
import tableStyles from "./PlTable.module.css";
import { PlErrorPanel, PlLoadingPanel, PlTeamLogo } from "./PlShared";

const PL_COMPETITION = "Premier League 2026/27";

function formatKickoff(kickoffUtc: string): string {
  const date = new Date(kickoffUtc);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function formatShortDate(kickoffUtc: string): string {
  const date = new Date(kickoffUtc);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { dateStyle: "medium" });
}

type PlMatchClientProps = {
  fixtureId: number;
};

export default function PlMatchClient({ fixtureId }: PlMatchClientProps) {
  const [shareNote, setShareNote] = useState<string | null>(null);
  const invalidId = !Number.isFinite(fixtureId) || fixtureId <= 0;
  const { data, error, isLoading } = useSWR<PlMatchApiResponse>(
    invalidId ? null : `/api/pl/match/${fixtureId}`,
    fetcher,
    LIVE_MATCH_SWR_OPTIONS,
  );

  const fixture = data?.fixture ?? null;
  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : "Unknown error"
    : invalidId
      ? "Invalid match link."
      : data && !data.fixture
        ? data.error ?? "Match not found."
        : null;

  const calendarEvent = useMemo((): CalendarEventInput | null => {
    if (!fixture) return null;
    return {
      homeTeam: fixture.homeTeamName,
      awayTeam: fixture.awayTeamName,
      kickoffUtc: fixture.kickoffUtc,
      venue: fixture.venue ?? undefined,
      competition: PL_COMPETITION,
      matchPageUrl: absoluteUrl(`/premier-league/match/${fixture.fixtureId}`),
      broadcaster:
        fixture.broadcaster !== "Local broadcaster information unavailable"
          ? fixture.broadcaster
          : undefined,
    };
  }, [fixture]);

  if (isLoading) {
    return (
      <main className={styles.plPage}>
        <PlLoadingPanel title="Loading match" text="Fetching match centre…" />
      </main>
    );
  }

  if (errorMessage || !fixture || !data) {
    return (
      <main className={styles.plPage}>
        <PlErrorPanel
          title="Match not available"
          text={errorMessage ?? data?.error ?? "This match could not be loaded."}
        />
        <p className={styles.backLinks}>
          <Link href="/premier-league/fixtures">← Back to fixtures</Link>
        </p>
      </main>
    );
  }

  const matchTitle = `${fixture.homeTeamName} vs ${fixture.awayTeamName}`;

  const handleShare = async () => {
    const url = absoluteUrl(`/premier-league/match/${fixture.fixtureId}`);
    try {
      if (navigator.share) {
        await navigator.share({ title: `${matchTitle} — ${PL_COMPETITION}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote("Link copied to clipboard.");
    } catch {
      setShareNote(null);
    }
  };

  return (
    <main className={styles.plPage}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/premier-league">Premier League</Link>
        <span>/</span>
        <Link href="/premier-league/fixtures">Fixtures</Link>
        <span>/</span>
        <span>{matchTitle}</span>
      </nav>

      <LiveMatchDashboard
        competition={fixture.matchweek !== null ? `Premier League · Matchweek ${fixture.matchweek}` : PL_COMPETITION}
        fixtureId={String(fixture.fixtureId)}
        favouriteMatchId={`pl:${fixture.fixtureId}`}
        homeTeamName={fixture.homeTeamName}
        homeTeamLogo={fixture.homeTeamLogo}
        awayTeamName={fixture.awayTeamName}
        awayTeamLogo={fixture.awayTeamLogo}
        status={fixture.status}
        elapsed={fixture.elapsed}
        homeScore={fixture.homeScore}
        awayScore={fixture.awayScore}
        kickoffLabel={formatKickoff(fixture.kickoffUtc)}
        venue={fixture.venue}
        referee={fixture.referee}
        events={data.events}
        lineups={data.lineups}
        statistics={data.statistics}
      />

      {calendarEvent ? (
        <div className={styles.actions}>
          {shareNote ? <p className={styles.shareNote}>{shareNote}</p> : null}
          <a
            href={buildGoogleCalendarUrl(calendarEvent)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionBtn}
          >
            Add to Google Calendar
          </a>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => downloadIcsFile(calendarEvent)}
          >
            Download .ics
          </button>
          <button type="button" className={styles.actionBtn} onClick={handleShare}>
            Share match
          </button>
        </div>
      ) : null}

      <section className={styles.section} aria-labelledby="pl-h2h">
        <h2 id="pl-h2h" className={styles.sectionTitle}>Head to head</h2>
        <div className={styles.panel}>
          {data.h2h.length === 0 ? (
            <p className={styles.emptyState}>Recent meetings between these sides will appear here.</p>
          ) : (
            data.h2h.map((row) => (
              <div key={row.fixtureId} className={styles.h2hRow}>
                <span className={styles.h2hTeam}>{row.homeTeamName}</span>
                <span className={styles.h2hScore}>
                  {row.homeScore !== null && row.awayScore !== null
                    ? `${row.homeScore} – ${row.awayScore}`
                    : row.status}
                </span>
                <span className={`${styles.h2hTeam} ${styles.h2hTeamAway}`}>
                  {row.awayTeamName}
                </span>
                <span className={styles.h2hDate}>{formatShortDate(row.kickoffUtc)}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="pl-table-snap">
        <h2 id="pl-table-snap" className={styles.sectionTitle}>League table snapshot</h2>
        <div className={styles.panel}>
          {data.standingsSnapshot.length === 0 ? (
            <p className={styles.emptyState}>Standings will appear when the season table is available.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Club</th>
                    <th scope="col">P</th>
                    <th scope="col">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {data.standingsSnapshot.map((row) => {
                    const highlight =
                      row.teamId === fixture.homeTeamId || row.teamId === fixture.awayTeamId;
                    return (
                      <tr key={row.teamId} className={highlight ? styles.tableHighlight : undefined}>
                        <td>{row.rank}</td>
                        <td>
                          <div className={styles.tableClub}>
                            <PlTeamLogo name={row.teamName} logo={row.teamLogo} size={22} />
                            {row.teamName}
                          </div>
                        </td>
                        <td>{row.played}</td>
                        <td className={styles.tablePts}>{row.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className={tableStyles.meta} style={{ marginTop: 10 }}>
            <Link href="/premier-league/table">Full table →</Link>
          </p>
        </div>
      </section>

      <p className={styles.backLinks}>
        <Link href="/premier-league/live">Live matches</Link>
        {" · "}
        <Link href="/premier-league/fixtures">Fixtures</Link>
        {" · "}
        <Link href="/premier-league">PL hub</Link>
      </p>
      <p className={tableStyles.meta}>
        Source: {data.source} · {SITE_NAME} · Updated{" "}
        {new Date(data.fetchedAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>
    </main>
  );
}

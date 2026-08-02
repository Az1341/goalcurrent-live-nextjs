"use client";

import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  resolveTimelineEventDisplay,
  resolveEventSide,
  sortTimelineEvents,
} from "@/components/match/timeline-event-badge";
import {
  buildGoogleCalendarUrl,
  downloadIcsFile,
  type CalendarEventInput,
} from "@/lib/calendar";
import type { PlMatchApiResponse, PlFixtureStatus } from "@/lib/pl/types";
import { absoluteUrl, SITE_NAME } from "@/lib/site-url";
import {
  MatchMovement,
  MatchPlayerStats,
} from "@/components/match/MatchDetailSections";
import { fetcher, LIVE_MATCH_SWR_OPTIONS } from "@/lib/client/fetcher";
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
  return date.toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
}

function statusLabel(status: PlFixtureStatus): string {
  switch (status) {
    case "LIVE":
      return "Live";
    case "FT":
      return "Full time";
    case "POSTPONED":
      return "Postponed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Upcoming";
  }
}

function timelineIconClass(tone: string): string {
  switch (tone) {
    case "goal":
    case "penalty":
    case "own-goal":
      return styles.timelineIconGoal;
    case "yellow":
    case "second-yellow":
      return styles.timelineIconYellow;
    case "red":
      return styles.timelineIconRed;
    case "subst":
      return styles.timelineIconSubst;
    default:
      return styles.timelineIconNeutral;
  }
}

type PlMatchClientProps = {
  fixtureId: number;
};

export default function PlMatchClient({ fixtureId }: PlMatchClientProps) {
  const [shareNote, setShareNote] = useState<string | null>(null);

  const invalidId = !Number.isFinite(fixtureId) || fixtureId <= 0;
  const url = invalidId ? null : `/api/pl/match/${fixtureId}`;

  const { data, error, isLoading } = useSWR<PlMatchApiResponse>(
    url,
    fetcher,
    LIVE_MATCH_SWR_OPTIONS,
  );

  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : "Unknown error"
    : invalidId
      ? "Invalid match link."
      : data && !data.fixture
        ? data.error ?? "Match not found."
        : null;

  const fixture = data?.fixture ?? null;

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

  const matchTitle = fixture
    ? `${fixture.homeTeamName} vs ${fixture.awayTeamName}`
    : "Premier League Match";

  const handleShare = async () => {
    if (!fixture) return;
    const url = absoluteUrl(`/premier-league/match/${fixture.fixtureId}`);
    const title = `${matchTitle} — ${PL_COMPETITION}`;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote("Link copied to clipboard.");
    } catch {
      setShareNote(null);
    }
  };

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
          text={
            errorMessage ??
            data?.error ??
            "This match could not be loaded."
          }
        />
        <p className={styles.backLinks}>
          <Link href="/premier-league/fixtures">← Back to fixtures</Link>
        </p>
      </main>
    );
  }

  const isLive = fixture.status === "LIVE";
  const isFinished = fixture.status === "FT";
  const showScore =
    fixture.homeScore !== null &&
    fixture.awayScore !== null &&
    (isLive || isFinished);

  const roundLabel =
    fixture.matchweek !== null
      ? `Matchweek ${fixture.matchweek}`
      : (fixture.round ?? PL_COMPETITION);

  const sortedEvents = sortTimelineEvents(data.events);

  return (
    <main className={styles.plPage}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/premier-league">Premier League</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <Link href="/premier-league/fixtures">Fixtures</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span>{matchTitle}</span>
      </nav>

      <header className={styles.hero} aria-labelledby="pl-match-title">
        <div className={styles.heroTop}>
          <div>
            <div className={styles.heroLabel} id="pl-match-title">
              Match centre
            </div>
            <div className={styles.heroComp}>{roundLabel}</div>
          </div>
          <span
            className={`${styles.statusBadge} ${isLive ? styles.statusLive : ""} ${isFinished ? styles.statusFt : ""}`}
          >
            {statusLabel(fixture.status)}
            {isLive && fixture.elapsed !== null ? ` · ${fixture.elapsed}'` : ""}
          </span>
        </div>

        <div className={styles.teamsRow}>
          <div className={styles.teamCol}>
            <span className={styles.teamLogo}>
              <PlTeamLogo
                name={fixture.homeTeamName}
                logo={fixture.homeTeamLogo}
                size={52}
              />
            </span>
            <span className={styles.teamName}>{fixture.homeTeamName}</span>
          </div>

          <div className={styles.scoreCol}>
            <div className={styles.scoreMain}>
              {showScore
                ? `${fixture.homeScore} – ${fixture.awayScore}`
                : "vs"}
            </div>
            {!isLive ? (
              <div className={styles.scoreSub}>{statusLabel(fixture.status)}</div>
            ) : null}
          </div>

          <div className={`${styles.teamCol} ${styles.teamColAway}`}>
            <span className={styles.teamLogo}>
              <PlTeamLogo
                name={fixture.awayTeamName}
                logo={fixture.awayTeamLogo}
                size={52}
              />
            </span>
            <span className={styles.teamName}>{fixture.awayTeamName}</span>
          </div>
        </div>

        <dl className={styles.metaGrid}>
          <div className={styles.metaRow}>
            <dt className={styles.metaLabel}>Kickoff</dt>
            <dd>{formatKickoff(fixture.kickoffUtc)}</dd>
          </div>
          {fixture.venue ? (
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Venue</dt>
              <dd>{fixture.venue}</dd>
            </div>
          ) : null}
          {fixture.referee ? (
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Referee</dt>
              <dd>{fixture.referee}</dd>
            </div>
          ) : null}
          {fixture.broadcaster !== "Local broadcaster information unavailable" ? (
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>TV</dt>
              <dd>{fixture.broadcaster}</dd>
            </div>
          ) : null}
        </dl>
      </header>

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

      <section className={styles.section} aria-labelledby="pl-timeline">
        <h2 id="pl-timeline" className={styles.sectionTitle}>
          Timeline
        </h2>
        <div className={styles.panel}>
          {sortedEvents.length === 0 ? (
            <p className={styles.emptyState}>
              {isFinished || isLive
                ? "No events recorded for this match yet."
                : "Goals, cards and substitutions will appear here during the match."}
            </p>
          ) : (
            <>
              <div className={styles.timelineBoardHeader} aria-hidden="true">
                <span className={styles.timelineBoardTeamHome}>
                  {fixture.homeTeamName}
                </span>
                <span className={styles.timelineBoardCenter}>Events</span>
                <span className={styles.timelineBoardTeamAway}>
                  {fixture.awayTeamName}
                </span>
              </div>
              <ol className={styles.timelineRows}>
                {sortedEvents.map((event, index) => {
                  const display = resolveTimelineEventDisplay(event);
                  const side = display.isPeriod
                    ? "neutral"
                    : resolveEventSide(
                        display.teamName,
                        fixture.homeTeamName,
                        fixture.awayTeamName,
                        data.lineups.home?.teamName ?? null,
                        data.lineups.away?.teamName ?? null,
                      );

                  if (display.isPeriod) {
                    return (
                      <li
                        key={`period-${display.minute}-${index}`}
                        className={`${styles.timelineRow} ${styles.timelineRowPeriod}`}
                      >
                        <div className={styles.timelineColPeriod}>
                          <article
                            className={`${styles.timelineCard} ${styles.timelineCardPeriod}`}
                          >
                            <span>{display.title}</span>
                          </article>
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li
                      key={`${event.minute}-${event.playerName}-${index}`}
                      className={styles.timelineRow}
                    >
                      <div className={styles.timelineColHome}>
                        {side === "home" ? (
                          <article
                            className={`${styles.timelineCard} ${styles.timelineCardHome}`}
                          >
                            <div className={styles.timelineCardRow}>
                              <span
                                className={`${styles.timelineIcon} ${timelineIconClass(display.badge.tone)}`}
                                aria-hidden="true"
                              >
                                {display.badge.symbol}
                              </span>
                              <div>
                                {display.playerName ? (
                                  <div className={styles.timelinePlayer}>
                                    {display.playerName}
                                  </div>
                                ) : null}
                                <div className={styles.timelineTitle}>
                                  {display.title}
                                </div>
                                {display.assistLabel ? (
                                  <div className={styles.timelineAssist}>
                                    {display.assistLabel}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </article>
                        ) : null}
                      </div>
                      <div className={styles.timelineColCenter}>
                        <span className={styles.timelineMinuteCenter}>
                          {display.minute}
                        </span>
                      </div>
                      <div className={styles.timelineColAway}>
                        {side === "away" ? (
                          <article
                            className={`${styles.timelineCard} ${styles.timelineCardAway}`}
                          >
                            <div className={styles.timelineCardRow}>
                              <span
                                className={`${styles.timelineIcon} ${timelineIconClass(display.badge.tone)}`}
                                aria-hidden="true"
                              >
                                {display.badge.symbol}
                              </span>
                              <div>
                                {display.playerName ? (
                                  <div className={styles.timelinePlayer}>
                                    {display.playerName}
                                  </div>
                                ) : null}
                                <div className={styles.timelineTitle}>
                                  {display.title}
                                </div>
                                {display.assistLabel ? (
                                  <div className={styles.timelineAssist}>
                                    {display.assistLabel}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </article>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="pl-lineups">
        <h2 id="pl-lineups" className={styles.sectionTitle}>
          Lineups
        </h2>
        <div className={styles.panel}>
          {!data.lineups.home && !data.lineups.away ? (
            <p className={styles.emptyState}>
              Lineups will be published closer to kickoff.
            </p>
          ) : (
            <div className={styles.lineupGrid}>
              {[data.lineups.home, data.lineups.away].map((side, index) => {
                const title =
                  index === 0 ? fixture.homeTeamName : fixture.awayTeamName;
                if (!side) {
                  return (
                    <div key={title} className={styles.lineupSide}>
                      <h3>{title}</h3>
                      <p className={styles.emptyState}>Lineup not available yet.</p>
                    </div>
                  );
                }
                return (
                  <div key={title} className={styles.lineupSide}>
                    <h3>{title}</h3>
                    <p className={styles.lineupMeta}>
                      {side.formation ? `Formation ${side.formation}` : "Formation TBC"}
                      {side.coach ? ` · ${side.coach}` : ""}
                    </p>
                    <p className={styles.lineupMeta}>Starting XI</p>
                    <ul className={styles.lineupList}>
                      {side.startXI.map((player) => (
                        <li
                          key={`${player.number}-${player.name}`}
                          className={styles.lineupPlayer}
                        >
                          <span className={styles.lineupNum}>
                            {player.number ?? "–"}
                          </span>
                          <span>
                            {player.name}
                            {player.position ? ` (${player.position})` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {side.substitutes.length > 0 ? (
                      <>
                        <p className={styles.lineupMeta} style={{ marginTop: 12 }}>
                          Bench
                        </p>
                        <ul className={styles.lineupList}>
                          {side.substitutes.map((player) => (
                            <li
                              key={`sub-${player.number}-${player.name}`}
                              className={styles.lineupPlayer}
                            >
                              <span className={styles.lineupNum}>
                                {player.number ?? "–"}
                              </span>
                              <span>{player.name}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <MatchMovement
        detail={{
          configured: data.configured,
          apiAvailable: data.apiAvailable,
          events: data.events,
          lineups: data.lineups,
          statistics: data.statistics,
          playerStats: [],
        }}
        loading={false}
      />

      <MatchPlayerStats
        detail={{
          configured: data.configured,
          apiAvailable: data.apiAvailable,
          events: data.events,
          lineups: data.lineups,
          statistics: data.statistics,
          playerStats: [],
        }}
        loading={false}
        homeTeamName={fixture.homeTeamName}
        awayTeamName={fixture.awayTeamName}
      />

      <section className={styles.section} aria-labelledby="pl-h2h">
        <h2 id="pl-h2h" className={styles.sectionTitle}>
          Head to head
        </h2>
        <div className={styles.panel}>
          {data.h2h.length === 0 ? (
            <p className={styles.emptyState}>
              Recent meetings between these sides will appear here.
            </p>
          ) : (
            data.h2h.map((row) => (
              <div key={row.fixtureId} className={styles.h2hRow}>
                <span className={styles.h2hTeam}>{row.homeTeamName}</span>
                <span className={styles.h2hScore}>
                  {row.homeScore !== null && row.awayScore !== null
                    ? `${row.homeScore} – ${row.awayScore}`
                    : statusLabel(row.status)}
                </span>
                <span className={`${styles.h2hTeam} ${styles.h2hTeamAway}`}>
                  {row.awayTeamName}
                </span>
                <span className={styles.h2hDate}>
                  {formatShortDate(row.kickoffUtc)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="pl-table-snap">
        <h2 id="pl-table-snap" className={styles.sectionTitle}>
          League table snapshot
        </h2>
        <div className={styles.panel}>
          {data.standingsSnapshot.length === 0 ? (
            <p className={styles.emptyState}>
              Standings will appear when the season table is available.
            </p>
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
                      row.teamId === fixture.homeTeamId ||
                      row.teamId === fixture.awayTeamId;
                    return (
                      <tr
                        key={row.teamId}
                        className={highlight ? styles.tableHighlight : undefined}
                      >
                        <td>{row.rank}</td>
                        <td>
                          <div className={styles.tableClub}>
                            <PlTeamLogo
                              name={row.teamName}
                              logo={row.teamLogo}
                              size={22}
                            />
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

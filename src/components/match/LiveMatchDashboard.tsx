"use client";

import { FavouriteMatchButton } from "@/components/FavouriteButton";
import { PlTeamBadge } from "@/components/pl/PlShared";
import { resolveLineupReadiness } from "@/lib/match-lineup-status";
import type {
  MatchEventItem,
  MatchLineupSide,
  MatchStatisticPair,
} from "@/types/match-detail";
import styles from "./LiveMatchDashboard.module.css";

type LiveMatchDashboardProps = {
  competition: string;
  fixtureId: string;
  favouriteMatchId?: string;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamName: string;
  awayTeamLogo: string | null;
  status: string;
  elapsed: number | null;
  homeScore: number | null;
  awayScore: number | null;
  kickoffLabel?: string | null;
  venue?: string | null;
  referee?: string | null;
  events: readonly MatchEventItem[];
  lineups: {
    home: MatchLineupSide | null;
    away: MatchLineupSide | null;
  };
  statistics: readonly MatchStatisticPair[];
};

function parseMetric(value: string | number | null): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const parsed = Number.parseFloat(value.replace("%", "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function metricText(value: string | number | null): string {
  return value == null || value === "" ? "–" : String(value);
}

function isGoal(event: MatchEventItem): boolean {
  const value = `${event.type} ${event.detail}`.toLowerCase();
  return value.includes("goal") || value.includes("penalty");
}

function eventTone(event: MatchEventItem): string {
  const value = `${event.type} ${event.detail}`.toLowerCase();
  if (value.includes("yellow")) return "🟨";
  if (value.includes("red")) return "🟥";
  if (value.includes("subst")) return "↔";
  if (isGoal(event)) return "⚽";
  return "•";
}

function Lineup({
  side,
  fallbackName,
}: {
  side: MatchLineupSide | null;
  fallbackName: string;
}) {
  return (
    <div className={styles.lineupSide}>
      <div className={styles.lineupHeading}>
        <strong>{side?.teamName ?? fallbackName}</strong>
        <span>{side?.formation ? `Formation ${side.formation}` : "Line-up pending"}</span>
      </div>
      {side?.startXI.length ? (
        <ol className={styles.playerList}>
          {side.startXI.map((player, index) => (
            <li key={`${player.name}-${player.number ?? index}`}>
              <span className={styles.playerNumber}>{player.number ?? "–"}</span>
              <span>{player.name}</span>
              <small>{player.position ?? ""}</small>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.pending}>Confirmed XI will appear automatically when released.</p>
      )}
    </div>
  );
}

export default function LiveMatchDashboard({
  competition,
  fixtureId,
  favouriteMatchId,
  homeTeamName,
  homeTeamLogo,
  awayTeamName,
  awayTeamLogo,
  status,
  elapsed,
  homeScore,
  awayScore,
  kickoffLabel,
  venue,
  referee,
  events,
  lineups,
  statistics,
}: LiveMatchDashboardProps) {
  const live = status.trim().toUpperCase() === "LIVE";
  const scoreReady = homeScore != null && awayScore != null;
  const possession = statistics.find((row) => row.label.toLowerCase().includes("possession"));
  const shots = statistics.find((row) => row.label.toLowerCase() === "total shots");
  const recentEvents = [...events]
    .sort((a, b) => (b.minute ?? -1) - (a.minute ?? -1))
    .slice(0, 14);

  return (
    <section className={styles.root} data-gc-live-match-dashboard data-fixture-id={fixtureId} aria-label={`${homeTeamName} vs ${awayTeamName} match centre`}>
      <header className={styles.scoreboard}>
        <div className={styles.scoreboardTop}>
          <div>
            <p className={styles.competition}>{competition}</p>
            <span className={`${styles.status} ${live ? styles.statusLive : ""}`}>
              {live ? `● LIVE${elapsed != null ? ` ${elapsed}'` : ""}` : status}
            </span>
          </div>
          {favouriteMatchId ? (
            <FavouriteMatchButton
              matchId={favouriteMatchId}
              label={`${homeTeamName} vs ${awayTeamName}`}
              className={styles.favourite}
            />
          ) : null}
        </div>

        <div className={styles.scoreRow}>
          <div className={styles.team}>
            <PlTeamBadge name={homeTeamName} logo={homeTeamLogo} size={60} />
            <strong>{homeTeamName}</strong>
          </div>
          <div className={styles.scoreBlock}>
            <span className={styles.score}>{scoreReady ? `${homeScore} – ${awayScore}` : "vs"}</span>
            {kickoffLabel ? <time className={styles.kickoff}>{kickoffLabel}</time> : null}
          </div>
          <div className={styles.team}>
            <PlTeamBadge name={awayTeamName} logo={awayTeamLogo} size={60} />
            <strong>{awayTeamName}</strong>
          </div>
        </div>

        <div className={styles.heroFacts}>
          <span>{venue ?? "Venue information pending"}</span>
          <span>{referee ? `Referee: ${referee}` : "Match officials update automatically"}</span>
          {possession ? (
            <span>
              Possession {metricText(possession.home)} / {metricText(possession.away)}
            </span>
          ) : null}
          {shots ? (
            <span>
              Shots {metricText(shots.home)} / {metricText(shots.away)}
            </span>
          ) : null}
        </div>
      </header>

      <div className={styles.dashboardGrid}>
        <section className={`${styles.glassPanel} ${styles.eventsPanel}`} aria-labelledby="live-events-heading">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>Live feed</p>
              <h2 id="live-events-heading">Match events</h2>
            </div>
            <span className={styles.liveDot}>{live ? "LIVE" : "AUTO"}</span>
          </div>
          {recentEvents.length ? (
            <ol className={styles.eventList}>
              {recentEvents.map((event, index) => (
                <li key={`${event.minute}-${event.playerName}-${index}`}>
                  <span className={styles.eventIcon} aria-hidden="true">{eventTone(event)}</span>
                  <div>
                    <strong>{event.playerName || event.detail || event.type}</strong>
                    <span>{event.teamName}</span>
                    {event.assistName ? <small>Assist: {event.assistName}</small> : null}
                  </div>
                  <time>{event.minute != null ? `${event.minute}'` : "–"}</time>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.pending}>Goals, cards and substitutions will appear here as the provider publishes them.</p>
          )}
        </section>

        <section className={`${styles.glassPanel} ${styles.pitchPanel}`} aria-labelledby="live-lineups-heading">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>Tactical view</p>
              <h2 id="live-lineups-heading">Line-ups</h2>
            </div>
            {(() => {
              const readiness = resolveLineupReadiness(lineups.home, lineups.away);
              return (
                <span
                  className={`${styles.liveDot} ${readiness === "PARTIAL" ? styles.liveDotPartial : ""}`}
                >
                  {readiness}
                </span>
              );
            })()}
          </div>
          <div className={styles.pitch} aria-label="Line-up tactical panel">
            <div className={styles.halfway} />
            <div className={styles.centreCircle} />
            <div className={styles.lineupGrid}>
              <Lineup side={lineups.home} fallbackName={homeTeamName} />
              <Lineup side={lineups.away} fallbackName={awayTeamName} />
            </div>
          </div>
        </section>

        <section className={`${styles.glassPanel} ${styles.statsPanel}`} aria-labelledby="live-stats-heading">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>Live data</p>
              <h2 id="live-stats-heading">Key stats</h2>
            </div>
          </div>
          {statistics.length ? (
            <div className={styles.statList}>
              {statistics.map((stat) => {
                const homeMetric = parseMetric(stat.home);
                const awayMetric = parseMetric(stat.away);
                const total = Math.max(0, (homeMetric ?? 0) + (awayMetric ?? 0));
                const homeWidth = total > 0 ? Math.round(((homeMetric ?? 0) / total) * 100) : 50;
                return (
                  <div key={stat.key} className={styles.stat}>
                    <div className={styles.statValues}>
                      <strong>{metricText(stat.home)}</strong>
                      <span>{stat.label}</span>
                      <strong>{metricText(stat.away)}</strong>
                    </div>
                    {homeMetric != null || awayMetric != null ? (
                      <div className={styles.statBar} aria-hidden="true">
                        <span style={{ width: `${homeWidth}%` }} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.pending}>Possession, shots, corners, cards and other verified match statistics will populate automatically.</p>
          )}
        </section>
      </div>
    </section>
  );
}

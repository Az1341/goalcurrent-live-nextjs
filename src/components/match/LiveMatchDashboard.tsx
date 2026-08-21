"use client";

import { FavouriteMatchButton } from "@/components/FavouriteButton";
import { PlTeamBadge } from "@/components/pl/PlShared";
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

function metricText(value: string | number | null): string {
  return value == null || value === "" ? "–" : String(value);
}

function eventTone(event: MatchEventItem): string {
  const value = `${event.type} ${event.detail}`.toLowerCase();
  if (value.includes("yellow")) return styles.eventYellow;
  if (value.includes("red")) return styles.eventRed;
  if (value.includes("subst")) return styles.eventGreen;
  if (value.includes("goal") || value.includes("penalty")) return styles.eventRed;
  return styles.eventNeutral;
}

function shortName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function LineupColumn({
  side,
  fallbackName,
}: {
  side: MatchLineupSide | null;
  fallbackName: string;
}) {
  return (
    <section className={styles.lineupColumn} aria-label={`${fallbackName} line-up`}>
      <div className={styles.lineupTitleRow}>
        <div>
          <strong>{side?.teamName ?? fallbackName}</strong>
          <span>{side?.formation ? `Formation ${side.formation}` : "Line-up pending"}</span>
        </div>
      </div>
      {side?.startXI.length ? (
        <ol className={styles.playerList}>
          {side.startXI.map((player, index) => (
            <li key={`${player.name}-${player.number ?? index}`}>
              <span className={styles.playerNumber}>{player.number ?? "–"}</span>
              <span className={styles.playerName}>{player.name}</span>
              <small>{player.position ?? ""}</small>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.pendingCopy}>Confirmed XI will appear automatically when released.</p>
      )}
    </section>
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
  const recentEvents = [...events]
    .sort((a, b) => (b.minute ?? -1) - (a.minute ?? -1))
    .slice(0, 16);
  const lineupsConfirmed = Boolean(lineups.home?.startXI.length || lineups.away?.startXI.length);

  return (
    <section
      className={styles.root}
      data-gc-live-match-dashboard
      data-fixture-id={fixtureId}
      aria-label={`${homeTeamName} vs ${awayTeamName} match centre`}
    >
      <div className={styles.ambientRed} aria-hidden="true" />
      <div className={styles.ambientGreen} aria-hidden="true" />

      <div className={styles.desktopGrid}>
        <aside className={`${styles.glassPanel} ${styles.leftPanel}`} aria-label="Match information and event timeline">
          <div className={styles.panelMetaRow}>
            <span className={`${styles.liveLabel} ${live ? styles.livePulse : ""}`}>
              {live ? `◉ LIVE${elapsed != null ? ` ${elapsed}'` : ""}` : status}
            </span>
            <span className={styles.competition}>{competition}</span>
          </div>

          <div className={styles.sideScoreboard}>
            <div className={styles.sideTeamRow}>
              <div className={styles.sideTeamIdentity}>
                <span className={styles.teamOrb} aria-hidden="true">{shortName(homeTeamName)}</span>
                <div>
                  <strong>{homeTeamName}</strong>
                  <span>Home</span>
                </div>
              </div>
              <span className={`${styles.sideScore} ${styles.scoreGreen}`}>{scoreReady ? homeScore : "–"}</span>
            </div>
            <div className={styles.sideTeamRow}>
              <div className={styles.sideTeamIdentity}>
                <span className={styles.teamOrb} aria-hidden="true">{shortName(awayTeamName)}</span>
                <div>
                  <strong>{awayTeamName}</strong>
                  <span>Away</span>
                </div>
              </div>
              <span className={styles.sideScore}>{scoreReady ? awayScore : "–"}</span>
            </div>
          </div>

          <div className={styles.timelineHeading}>
            <h2>Event Timeline</h2>
            <span>{recentEvents.length ? `${recentEvents.length} updates` : "Live feed"}</span>
          </div>

          {recentEvents.length ? (
            <ol className={styles.timeline}>
              {recentEvents.map((event, index) => (
                <li key={`${event.minute}-${event.playerName}-${index}`}>
                  <span className={`${styles.timelineDot} ${eventTone(event)}`} aria-hidden="true" />
                  <div className={styles.timelineBody}>
                    <time>{event.minute != null ? `${event.minute}'` : "–"}</time>
                    <strong>{event.playerName || event.detail || event.type}</strong>
                    <span>{event.teamName}</span>
                    {event.assistName ? <small>Assist: {event.assistName}</small> : null}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.emptyTimeline}>Goals, cards and substitutions will appear here as verified data arrives.</p>
          )}
        </aside>

        <main className={styles.centerStage}>
          <header className={`${styles.glassPanel} ${styles.scoreHero}`}>
            <div className={styles.heroStatusRow}>
              <span className={`${styles.liveLabel} ${live ? styles.livePulse : ""}`}>
                {live ? `LIVE ${elapsed != null ? `${elapsed}'` : ""}` : status}
              </span>
              {favouriteMatchId ? (
                <FavouriteMatchButton
                  matchId={favouriteMatchId}
                  label={`${homeTeamName} vs ${awayTeamName}`}
                  className={styles.favourite}
                />
              ) : null}
            </div>

            <div className={styles.heroTeams}>
              <div className={styles.heroTeam}>
                <PlTeamBadge name={homeTeamName} logo={homeTeamLogo} size={58} />
                <strong>{homeTeamName}</strong>
              </div>
              <div className={styles.heroScoreBlock}>
                <span className={styles.heroScore}>{scoreReady ? `${homeScore} – ${awayScore}` : "VS"}</span>
                {kickoffLabel ? <time>{kickoffLabel}</time> : null}
              </div>
              <div className={styles.heroTeam}>
                <PlTeamBadge name={awayTeamName} logo={awayTeamLogo} size={58} />
                <strong>{awayTeamName}</strong>
              </div>
            </div>

            <div className={styles.heroFacts}>
              <span>{venue ?? "Venue pending"}</span>
              <span>{referee ? `Referee: ${referee}` : "Officials pending"}</span>
            </div>
          </header>

          <section className={`${styles.glassPanel} ${styles.pitchStage}`} aria-labelledby="live-lineups-heading">
            <div className={styles.pitchTopbar}>
              <div>
                <span className={styles.sectionKicker}>Tactical view</span>
                <h2 id="live-lineups-heading">Line-ups</h2>
              </div>
              <span className={`${styles.stateChip} ${lineupsConfirmed ? styles.stateChipGreen : ""}`}>
                {lineupsConfirmed ? "CONFIRMED" : "PENDING"}
              </span>
            </div>

            <div className={styles.pitch} aria-label="Tactical line-up pitch">
              <div className={styles.pitchGlow} aria-hidden="true" />
              <div className={styles.pitchBoundary} aria-hidden="true" />
              <div className={styles.pitchHalfway} aria-hidden="true" />
              <div className={styles.pitchCircle} aria-hidden="true" />
              <div className={styles.pitchBoxLeft} aria-hidden="true" />
              <div className={styles.pitchBoxRight} aria-hidden="true" />
              <div className={styles.lineupGrid}>
                <LineupColumn side={lineups.home} fallbackName={homeTeamName} />
                <LineupColumn side={lineups.away} fallbackName={awayTeamName} />
              </div>
            </div>

            <div className={styles.pitchControls} aria-label="Tactical view controls">
              <span className={styles.controlActive}>Broadcast</span>
              <span>Top-Down</span>
              <span>Coach</span>
              <span className={styles.controlDivider} aria-hidden="true" />
              <span className={styles.switchOn} aria-hidden="true"><i /></span>
              <span>Line-ups</span>
            </div>
          </section>
        </main>

        <aside className={styles.rightRail} aria-label="Live match statistics">
          <section className={`${styles.glassPanel} ${styles.rightCard}`}>
            <div className={styles.rightCardHeading}>
              <div>
                <span className={styles.sectionKicker}>Live data</span>
                <h2>Match Stats</h2>
              </div>
            </div>
            {statistics.length ? (
              <div className={styles.statList}>
                {statistics.slice(0, 9).map((stat) => (
                  <div key={stat.key} className={styles.statRow}>
                    <strong>{metricText(stat.home)}</strong>
                    <span>{stat.label}</span>
                    <strong>{metricText(stat.away)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.pendingCopy}>Verified possession, shots, corners, cards and other match statistics will appear automatically.</p>
            )}
          </section>

          <section className={`${styles.glassPanel} ${styles.rightCard}`}>
            <div className={styles.rightCardHeading}>
              <div>
                <span className={styles.sectionKicker}>Match centre</span>
                <h2>Fixture Details</h2>
              </div>
            </div>
            <dl className={styles.factList}>
              <div><dt>Competition</dt><dd>{competition}</dd></div>
              <div><dt>Venue</dt><dd>{venue ?? "Pending"}</dd></div>
              <div><dt>Referee</dt><dd>{referee ?? "Pending"}</dd></div>
              <div><dt>Status</dt><dd>{live ? `Live${elapsed != null ? ` · ${elapsed}'` : ""}` : status}</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </section>
  );
}

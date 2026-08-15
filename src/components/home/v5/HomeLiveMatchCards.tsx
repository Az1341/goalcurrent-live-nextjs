"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useLocalizedKickoffTime } from "@/lib/client/use-local-kickoff";
import type { HomepageMatchView } from "@/lib/wc26-live";
import type { PlFixtureRow } from "@/lib/pl/types";
import TeamFlag from "@/components/TeamFlag";
import { PlTeamBadge } from "@/components/pl/PlShared";
import { FavouriteMatchButton } from "@/components/FavouriteButton";
import { matchHref } from "@/lib/wc26-match";
import { isLocalToday } from "@/lib/date-utils";
import styles from "../home-v5.module.css";
import favouriteStyles from "./HomeMatchFavourite.module.css";

function Wc26StatusPill({ match }: { match: HomepageMatchView }) {
  const kickoffTime = useLocalizedKickoffTime(match.kickoffUtc);
  if (match.matchClass === "live") {
    const label =
      match.elapsed != null ? `LIVE ${match.elapsed}'` : match.statusLabel;
    return <span className={styles.statusLive}>{label}</span>;
  }
  if (match.matchClass === "ft") {
    return <span className={styles.statusFt}>{match.statusLabel}</span>;
  }
  return <span className={styles.statusUpcoming}>{kickoffTime}</span>;
}

function PlStatusPill({ fixture }: { fixture: PlFixtureRow }) {
  const kickoffTime = useLocalizedKickoffTime(fixture.kickoffUtc);
  if (fixture.status === "LIVE") {
    const short = fixture.statusShort?.trim().toUpperCase();
    const period =
      short === "1H" || short === "2H" || short === "HT" || short === "ET" || short === "P"
        ? short === "P"
          ? "PEN"
          : short
        : null;
    const label =
      fixture.elapsed != null
        ? `LIVE ${fixture.elapsed}'`
        : period ?? "LIVE";
    return <span className={styles.statusLive}>{label}</span>;
  }
  if (fixture.status === "FT") {
    const short = fixture.statusShort?.trim().toUpperCase();
    const label =
      short === "AET" || short === "PEN" ? short : "FT";
    return <span className={styles.statusFt}>{label}</span>;
  }
  if (fixture.status === "POSTPONED") {
    return <span className={styles.statusUpcoming}>PST</span>;
  }
  if (fixture.status === "CANCELLED") {
    return <span className={styles.statusUpcoming}>CANC</span>;
  }
  return <span className={styles.statusUpcoming}>{kickoffTime}</span>;
}

function Wc26MatchCard({
  match,
  compact = false,
}: {
  match: HomepageMatchView;
  compact?: boolean;
}) {
  const hasScore =
    match.matchClass === "live" ||
    match.matchClass === "ft" ||
    match.score != null;
  const homeScore = hasScore ? (match.score?.home ?? 0) : "–";
  const awayScore = hasScore ? (match.score?.away ?? 0) : "–";
  const cardClass = compact ? styles.todayMatchCard : styles.liveCard;
  const label = `${match.homeName} vs ${match.awayName}`;

  return (
    <div className={favouriteStyles.cardShell}>
      <Link href={matchHref(match.fixtureId)} className={cardClass}>
        <div className={styles.liveCardTop}>
          <span className={styles.liveCardComp}>World Cup 2026</span>
          <Wc26StatusPill match={match} />
        </div>
        <div className={styles.liveCardTeams}>
          <div className={styles.liveCardTeamRow}>
            <div className={styles.liveCardTeamLeft}>
              <TeamFlag teamId={match.homeTeamId} teamName={match.homeName} size={32} />
              <span className={styles.liveCardTeamName}>{match.homeName}</span>
            </div>
            <span className={styles.liveCardScore}>{homeScore}</span>
          </div>
          <div className={styles.liveCardTeamRow}>
            <div className={styles.liveCardTeamLeft}>
              <TeamFlag teamId={match.awayTeamId} teamName={match.awayName} size={32} />
              <span className={styles.liveCardTeamName}>{match.awayName}</span>
            </div>
            <span className={styles.liveCardScore}>{awayScore}</span>
          </div>
        </div>
      </Link>
      <FavouriteMatchButton
        matchId={match.fixtureId}
        label={label}
        className={favouriteStyles.star}
      />
    </div>
  );
}

function PlMatchCard({
  fixture,
  compact = false,
}: {
  fixture: PlFixtureRow;
  compact?: boolean;
}) {
  const hasScore =
    fixture.status === "FT" ||
    fixture.status === "LIVE" ||
    (fixture.homeScore != null && fixture.awayScore != null);
  const homeScore = hasScore ? (fixture.homeScore ?? 0) : "–";
  const awayScore = hasScore ? (fixture.awayScore ?? 0) : "–";
  const cardClass = compact ? styles.todayMatchCard : styles.liveCard;
  const label = `${fixture.homeTeamName} vs ${fixture.awayTeamName}`;

  return (
    <div className={favouriteStyles.cardShell}>
      <Link
        href={`/premier-league/match/${fixture.fixtureId}`}
        className={cardClass}
      >
        <div className={styles.liveCardTop}>
          <span className={styles.liveCardComp}>Premier League 26/27</span>
          <PlStatusPill fixture={fixture} />
        </div>
        <div className={styles.liveCardTeams}>
          <div className={styles.liveCardTeamRow}>
            <div className={styles.liveCardTeamLeft}>
              <PlTeamBadge
                name={fixture.homeTeamName}
                logo={fixture.homeTeamLogo}
                size={32}
              />
              <span className={styles.liveCardTeamName}>{fixture.homeTeamName}</span>
            </div>
            <span className={styles.liveCardScore}>{homeScore}</span>
          </div>
          <div className={styles.liveCardTeamRow}>
            <div className={styles.liveCardTeamLeft}>
              <PlTeamBadge
                name={fixture.awayTeamName}
                logo={fixture.awayTeamLogo}
                size={32}
              />
              <span className={styles.liveCardTeamName}>{fixture.awayTeamName}</span>
            </div>
            <span className={styles.liveCardScore}>{awayScore}</span>
          </div>
        </div>
      </Link>
      <FavouriteMatchButton
        matchId={`pl:${fixture.fixtureId}`}
        label={label}
        className={favouriteStyles.star}
      />
    </div>
  );
}

function orderPlForFeatured(fixtures: readonly PlFixtureRow[]): PlFixtureRow[] {
  const live = fixtures.filter((f) => f.status === "LIVE");
  const todayRest = fixtures.filter(
    (f) => f.status !== "LIVE" && isLocalToday(f.kickoffUtc),
  );
  const upcoming = fixtures.filter(
    (f) => f.status !== "LIVE" && !isLocalToday(f.kickoffUtc),
  );
  return [...live, ...todayRest, ...upcoming].sort(
    (a, b) =>
      new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime(),
  );
}

type HomeFeaturedMatchCardsProps = {
  wc26Views: readonly HomepageMatchView[];
  plFixtures: readonly PlFixtureRow[];
  compact?: boolean;
  limit?: number;
};

export default function HomeFeaturedMatchCards({
  wc26Views,
  plFixtures,
  compact = false,
  limit = 3,
}: HomeFeaturedMatchCardsProps) {
  const cards = useMemo(() => {
    const nodes: ReactNode[] = [];
    for (const match of wc26Views.slice(0, limit)) {
      nodes.push(
        <Wc26MatchCard key={match.fixtureId} match={match} compact={compact} />,
      );
    }
    if (nodes.length < limit) {
      for (const fixture of orderPlForFeatured(plFixtures).slice(
        0,
        limit - nodes.length,
      )) {
        nodes.push(
          <PlMatchCard
            key={`pl-${fixture.fixtureId}`}
            fixture={fixture}
            compact={compact}
          />,
        );
      }
    }
    return nodes;
  }, [wc26Views, plFixtures, compact, limit]);

  if (cards.length === 0) {
    return null;
  }

  return (
    <div
      className={compact ? styles.todayCardGrid : styles.liveCardsGrid}
      data-gc-featured-matches
    >
      {cards}
    </div>
  );
}

export { Wc26MatchCard, PlMatchCard };

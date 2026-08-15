"use client";

import { useMemo } from "react";
import Link from "next/link";
import TeamFlag from "@/components/TeamFlag";
import { FavouriteTeamButton } from "@/components/FavouriteButton";
import FixturesList from "@/components/wc26/FixturesList";
import GroupStandingsSection from "@/components/wc26/GroupStandingsSection";
import { getTeamById, groupLabel } from "@/data/wc26";
import { useEffectiveFixtures } from "@/lib/use-effective-fixtures";
import { getWc26TeamHistory } from "@/lib/team-profile/wc26-history";
import {
  computeWc26Form,
  filterWc26TeamFixtures,
  getLatestWc26Result,
  getNextWc26Fixture,
  getWc26H2H,
} from "@/lib/team-profile/fixture-utils";
import { groupHref, WC26_HUB_HREF } from "@/lib/wc26-groups";
import { matchHref } from "@/lib/wc26-match";
import ProfileFormStrip from "./ProfileFormStrip";
import ProfileGossipSection from "./ProfileGossipSection";
import ProfileHistorySection from "./ProfileHistorySection";
import ProfileH2HSection, { type H2HMatch } from "./ProfileH2HSection";
import ProfileInjurySection from "./ProfileInjurySection";
import ProfileNewsSection from "./ProfileNewsSection";
import ProfileSection from "./ProfileSection";
import ProfileVideoSection from "./ProfileVideoSection";
import ProfileFallback from "./ProfileFallback";
import styles from "./team-profile.module.css";

function formatKickoff(kickoffUtc: string): string {
  const date = new Date(kickoffUtc);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function Wc26TeamProfileClient({ teamId }: { teamId: string }) {
  const team = getTeamById(teamId);
  const allFixtures = useEffectiveFixtures();
  const fixtures = useMemo(() => filterWc26TeamFixtures(allFixtures, teamId), [allFixtures, teamId]);
  const history = team ? getWc26TeamHistory(team) : null;
  const latest = useMemo(() => getLatestWc26Result(allFixtures, teamId), [allFixtures, teamId]);
  const next = useMemo(() => getNextWc26Fixture(allFixtures, teamId), [allFixtures, teamId]);
  const form = useMemo(() => computeWc26Form(allFixtures, teamId), [allFixtures, teamId]);

  const nextOpponent = useMemo(() => {
    if (!next || !team) return null;
    const opponentId = next.homeTeamId === teamId ? next.awayTeamId : next.homeTeamId;
    return getTeamById(opponentId);
  }, [next, team, teamId]);

  const h2hMatches: H2HMatch[] = useMemo(() => {
    if (!nextOpponent) return [];
    return getWc26H2H(allFixtures, teamId, nextOpponent.id).slice(0, 5).map((fixture) => ({
      id: fixture.id,
      label: `${getTeamById(fixture.homeTeamId)?.name ?? fixture.homeTeamId} vs ${getTeamById(fixture.awayTeamId)?.name ?? fixture.awayTeamId}`,
      score: `${fixture.homeScore ?? 0}-${fixture.awayScore ?? 0}`,
      date: formatKickoff(fixture.kickoffUtc),
    }));
  }, [allFixtures, teamId, nextOpponent]);

  if (!team) {
    return (
      <main className={styles.page}>
        <ProfileFallback message="Team not found." />
        <div className={styles.navRow}><Link href="/worldcup2026/teams" className={styles.navLink}>All teams</Link></div>
      </main>
    );
  }

  const groupTitle = groupLabel(team.groupId);
  const newsKeywords = [team.name, team.code, ...team.aliases, "World Cup 2026"];

  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <Link href={WC26_HUB_HREF}>World Cup 2026</Link> / <Link href="/worldcup2026/teams">Teams</Link> / <strong>{team.name}</strong>
      </nav>
      <header className={styles.hero}>
        <TeamFlag teamId={team.id} size={56} />
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>{team.name}</h1>
          <p className={styles.heroMeta}>FIFA World Cup 2026 - {team.code} - <Link href={groupHref(team.groupId)} className={styles.heroLink}>{groupTitle}</Link></p>
          {history ? <p className={styles.heroSummary}>{history.summary}</p> : null}
        </div>
        <FavouriteTeamButton teamId={team.id} teamName={team.name} />
      </header>
      <div className={styles.statsRow}>
        <div className={styles.statCard}><div className={styles.statValue}>{team.code}</div><div className={styles.statLabel}>FIFA code</div></div>
        <div className={styles.statCard}><div className={styles.statValue}>{team.groupId.toUpperCase()}</div><div className={styles.statLabel}>Group</div></div>
        <div className={styles.statCard}><div className={styles.statValue}>{fixtures.length}</div><div className={styles.statLabel}>Fixtures</div></div>
        <div className={styles.statCard}><div className={styles.statValue}>{form.filter((r) => r === "W").length}</div><div className={styles.statLabel}>Wins (form)</div></div>
      </div>
      <ProfileSection id="profile-form" title="Current form">{form.length ? <ProfileFormStrip form={form} /> : <ProfileFallback message="Form will appear once group matches are played." />}</ProfileSection>
      <ProfileSection id="profile-latest" title="Latest result">
        {latest ? (
          <div className={styles.matchHighlight}>
            <span className={styles.matchTeams}>{getTeamById(latest.homeTeamId)?.name ?? latest.homeTeamId} vs {getTeamById(latest.awayTeamId)?.name ?? latest.awayTeamId}</span>
            <span className={styles.matchScore}>{latest.homeScore ?? 0} - {latest.awayScore ?? 0}</span>
            <span className={styles.matchMeta}>{formatKickoff(latest.kickoffUtc)}</span>
            <Link href={matchHref(latest.id)}>View match</Link>
          </div>
        ) : <ProfileFallback message="No results available yet." />}
      </ProfileSection>
      <ProfileSection id="profile-next" title="Next match">
        {next ? (
          <div className={styles.matchHighlight}>
            <span className={styles.matchTeams}>{getTeamById(next.homeTeamId)?.name ?? next.homeTeamId} vs {getTeamById(next.awayTeamId)?.name ?? next.awayTeamId}</span>
            <span className={styles.matchMeta}>{formatKickoff(next.kickoffUtc)}</span>
            <Link href={matchHref(next.id)}>View match</Link>
          </div>
        ) : <ProfileFallback message="No upcoming fixtures scheduled yet." />}
      </ProfileSection>
      <GroupStandingsSection groupId={team.groupId} sectionHeading={`${groupTitle} standings`} />
      <ProfileSection id="profile-fixtures" title="Fixtures and results">{fixtures.length ? <FixturesList fixtures={fixtures} /> : <ProfileFallback message="Fixtures will appear when available." />}</ProfileSection>
      <ProfileNewsSection keywords={newsKeywords} />
      {history ? <ProfileHistorySection summary={history.summary} achievements={history.achievements} extra={history.worldCupBackground} /> : null}
      <ProfileGossipSection variant="wc26" entityName={team.name} />
      <ProfileInjurySection variant="wc26" entityName={team.name} />
      <ProfileVideoSection />
      <ProfileH2HSection opponentName={nextOpponent?.name ?? null} matches={h2hMatches} />
      <nav className={styles.navRow}>
        <Link href={groupHref(team.groupId)} className={styles.navLink}>View {groupTitle}</Link>
        <Link href="/worldcup2026/teams" className={`${styles.navLink} ${styles.navLinkPrimary}`}>All teams</Link>
        <Link href="/worldcup2026/fixtures" className={styles.navLink}>Fixtures</Link>
      </nav>
    </main>
  );
}

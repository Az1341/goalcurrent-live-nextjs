"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import LiveScoreAdUnit from "@/components/ads/LiveScoreAdUnit";
import LiveMatchCard from "@/components/live/LiveMatchCard";
import PlLivePanel from "@/components/live/PlLivePanel";
import UnlLivePanel from "@/components/live/UnlLivePanel";
import UpcomingCompetitionCards from "@/components/live/UpcomingCompetitionCards";
import UpcomingMatchCountdown from "@/components/live/UpcomingMatchCountdown";
import { groupLabel } from "@/data/wc26";
import type { EffectiveFixture } from "@/lib/wc26-fixture-overlay";
import { formatStageLabel } from "@/lib/wc26-fixtures-page";
import {
  partitionFixturesForLiveCentre,
  isLiveMatchStatus,
  resolveFixtureParticipant,
  findNextUpcomingMatch,
  shouldShowUpcomingCountdown,
} from "@/lib/wc26-live";
import { useEffectiveFixtures } from "@/lib/use-effective-fixtures";
import { useWc26SyncStatus } from "@/lib/use-wc26-sync-status";
import { isWc26TournamentComplete } from "@/lib/wc26/archive";
import MatchLineupPitchSection from "@/components/match/MatchLineupPitchSection";
import { matchHref } from "@/lib/wc26-match";
import styles from "./live.module.css";

type LiveSectionProps = {
  id: string;
  title: string;
  fixtures: readonly EffectiveFixture[];
  allFixtures: readonly EffectiveFixture[];
  emptyMessage?: string;
  showLiveIndicator?: boolean;
  tone?: "live" | "today" | "upcoming" | "completed";
  emptyContent?: ReactNode;
};

function competitionLabel(fixture: EffectiveFixture): string {
  return fixture.groupId
    ? groupLabel(fixture.groupId)
    : formatStageLabel(fixture.stage);
}

function groupFixturesByCompetition(
  fixtures: readonly EffectiveFixture[],
): { label: string; fixtures: EffectiveFixture[] }[] {
  const map = new Map<string, EffectiveFixture[]>();
  for (const fixture of fixtures) {
    const label = competitionLabel(fixture);
    const bucket = map.get(label) ?? [];
    bucket.push(fixture);
    map.set(label, bucket);
  }
  return [...map.entries()].map(([label, items]) => ({
    label,
    fixtures: items,
  }));
}

function sectionToneClass(tone: LiveSectionProps["tone"]): string {
  switch (tone) {
    case "today":
      return styles.sectionToday;
    case "upcoming":
      return styles.sectionUpcoming;
    case "completed":
      return styles.sectionCompleted;
    case "live":
      return styles.sectionLiveNow;
    default:
      return "";
  }
}

function LiveSection({
  id,
  title,
  fixtures,
  allFixtures,
  emptyMessage,
  showLiveIndicator,
  tone,
  emptyContent,
}: LiveSectionProps) {
  const groups = useMemo(
    () => groupFixturesByCompetition(fixtures),
    [fixtures],
  );
  let liveAdIndex = 0;

  return (
    <section
      className={`${styles.section} ${sectionToneClass(tone)}`}
      aria-labelledby={id}
      data-gc-light-surface="true"
    >
      <div className={styles.sectionHeader}>
        {showLiveIndicator && fixtures.length > 0 ? (
          <span className={styles.liveDot} aria-hidden="true" />
        ) : null}
        <h2 id={id} className={styles.sectionTitle}>
          {title}
        </h2>
        {fixtures.length > 0 ? (
          <span className={styles.sectionCount}>{fixtures.length}</span>
        ) : null}
      </div>
      {fixtures.length === 0 && emptyContent ? emptyContent : null}
      {fixtures.length === 0 && !emptyContent && emptyMessage ? (
        <p className={styles.emptyState}>{emptyMessage}</p>
      ) : null}
      {fixtures.length > 0 ? (
        <div className={styles.matchPanel} data-gc-light-surface="true">
          {groups.map((group) => (
            <div key={group.label} className={styles.competitionBlock}>
              <div className={styles.competitionHeader}>{group.label}</div>
              <ul className={styles.fixtureList}>
                {group.fixtures.map((fixture) => {
                  const adIndex = liveAdIndex++;
                  return (
                    <Fragment key={fixture.id}>
                      <LiveMatchCard fixture={fixture} fixtures={allFixtures} />
                      {tone === "live" ? <LiveScoreAdUnit index={adIndex} /> : null}
                    </Fragment>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function LiveMatchCentre() {
  const t = useTranslations("live");
  const fixtures = useEffectiveFixtures();
  const syncStatus = useWc26SyncStatus();
  const buckets = useMemo(
    () => partitionFixturesForLiveCentre(fixtures),
    [fixtures],
  );

  const [clockMs, setClockMs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setClockMs(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  const archiveComplete = isWc26TournamentComplete();

  const featuredFixture = useMemo<EffectiveFixture | undefined>(() => {
    if (archiveComplete || buckets.live.length > 0) return undefined;
    const next = findNextUpcomingMatch(fixtures, new Date(clockMs));
    if (!next || !shouldShowUpcomingCountdown(next)) return undefined;
    return next;
  }, [archiveComplete, buckets.live.length, fixtures, clockMs]);

  const showSyncPending =
    syncStatus === "pending" &&
    !archiveComplete &&
    buckets.live.length === 0 &&
    buckets.completed.length === 0;
  const showSyncDegraded = syncStatus === "degraded" && !archiveComplete;

  if (archiveComplete) {
    return (
      <main className={styles.content}>
        <h1 className={styles.pageTitle}>{t("neutralPageTitle")}</h1>
        <p className={styles.pageIntro}>{t("neutralPageIntro")}</p>

        <UpcomingCompetitionCards />

        <UnlLivePanel />
        <PlLivePanel />

        <p className={styles.hubBack}>
          <Link href="/worldcup2026">{t("archiveHubLink")}</Link>
        </p>
      </main>
    );
  }

  return (
    <main className={styles.content}>
      <h1 className={styles.pageTitle}>
        {t("pageTitle", { competition: t("competition") })}
      </h1>
      <p className={styles.pageIntro}>{t("pageIntro")}</p>

      {showSyncPending || showSyncDegraded ? (
        <div className={styles.syncStatusSlot}>
          {showSyncPending ? (
            <p className={styles.syncStatus} role="status" aria-live="polite">
              <span className={styles.syncStatusDot} aria-hidden="true" />
              {t("syncPending")}
            </p>
          ) : null}
          {showSyncDegraded ? (
            <p
              className={styles.syncStatusDegraded}
              role="status"
              aria-live="polite"
            >
              {t("syncDegraded")}
            </p>
          ) : null}
        </div>
      ) : null}

      <UpcomingCompetitionCards />

      <LiveSection
        id="live-now-heading"
        title={t("sections.liveNow")}
        fixtures={buckets.live}
        allFixtures={fixtures}
        emptyMessage={t("empty.liveNow")}
        emptyContent={
          featuredFixture ? (
            <UpcomingMatchCountdown fixture={featuredFixture} />
          ) : undefined
        }
        showLiveIndicator
        tone="live"
      />

      {buckets.live.length > 0 ? (
        <div className={styles.livePitchStack}>
          {buckets.live.map((fixture) => {
            const home = resolveFixtureParticipant(fixture, "home", fixtures);
            const away = resolveFixtureParticipant(fixture, "away", fixtures);
            return (
              <div key={`pitch-${fixture.id}`} className={styles.livePitchCard}>
                <MatchLineupPitchSection
                  fixtureId={fixture.id}
                  matchNumber={fixture.matchNumber}
                  homeTeamId={home.teamId}
                  awayTeamId={away.teamId}
                  kickoffUtc={fixture.kickoffUtc}
                  matchStatus={fixture.status}
                  poll={isLiveMatchStatus(fixture.status)}
                  variant="embedded"
                  matchHref={matchHref(fixture.id)}
                />
              </div>
            );
          })}
        </div>
      ) : null}

      <LiveSection
        id="today-heading"
        title={t("sections.today")}
        fixtures={buckets.today}
        allFixtures={fixtures}
        emptyMessage={t("empty.today")}
        tone="today"
      />

      <LiveSection
        id="upcoming-heading"
        title={t("sections.upcoming")}
        fixtures={buckets.upcoming}
        allFixtures={fixtures}
        tone="upcoming"
      />

      <UnlLivePanel />
      <PlLivePanel />

      <p className={styles.hubBack}>
        <Link href="/worldcup2026">{t("backToHub")}</Link>
      </p>
    </main>
  );
}

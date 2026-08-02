"use client";

import { WC26_TOURNAMENT } from "@/data/wc26";
import { isWc26TournamentComplete } from "@/lib/wc26/archive";
import { useTournamentStats } from "@/lib/use-tournament-stats";
import styles from "./wc26.module.css";

export type HubStatTone =
  | "teams"
  | "matches"
  | "venues"
  | "groups"
  | "hosts"
  | "played"
  | "left"
  | "goals";

type StatItem = {
  value: number | string;
  label: string;
  tone: HubStatTone;
};

type Wc26HeroStatsProps = {
  /** Hub shows Groups; homepage hero shows Hosts. */
  variant?: "home" | "hub";
};

const TONE_CLASS: Record<HubStatTone, string> = {
  teams: styles.hubStatChipTeams,
  matches: styles.hubStatChipMatches,
  venues: styles.hubStatChipVenues,
  groups: styles.hubStatChipGroups,
  hosts: styles.hubStatChipHosts,
  played: styles.hubStatChipPlayed,
  left: styles.hubStatChipLeft,
  goals: styles.hubStatChipGoals,
};

export default function Wc26HeroStats({ variant = "hub" }: Wc26HeroStatsProps) {
  const { gamesPlayed, gamesLeft, totalGoals } = useTournamentStats();
  const archiveComplete = isWc26TournamentComplete();

  const fourthStat: StatItem =
    variant === "home"
      ? { value: WC26_TOURNAMENT.hosts.length, label: "Hosts", tone: "hosts" }
      : { value: WC26_TOURNAMENT.groupCount, label: "Groups", tone: "groups" };

  const goalsValue: number | string = totalGoals;
  const goalsStillLoading = false;

  const stats: StatItem[] = [
    { value: WC26_TOURNAMENT.teamCount, label: "Teams", tone: "teams" },
    { value: WC26_TOURNAMENT.fixtureCount, label: "Matches", tone: "matches" },
    { value: WC26_TOURNAMENT.venueCount, label: "Venues", tone: "venues" },
    fourthStat,
    { value: gamesPlayed, label: "Games Played", tone: "played" },
    ...(archiveComplete
      ? []
      : [{ value: gamesLeft, label: "Games Left", tone: "left" as const }]),
    {
      value: goalsValue,
      label: "Total Goals Scored",
      tone: "goals",
    },
  ];

  return (
    <div className={styles.hubStats} data-gc-light-surface="true">
      {stats.map(({ value, label, tone }) => {
        const goalsLoadingChip = tone === "goals" && goalsStillLoading;

        return (
          <div
            key={label}
            className={[styles.hubStatChip, TONE_CLASS[tone]].join(" ")}
          >
            <div
              className={[
                styles.hubStatNum,
                goalsLoadingChip ? styles.hubStatNumGoalsLoading : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-busy={goalsLoadingChip ? true : undefined}
              aria-label={
                goalsLoadingChip ? "Calculating verified goals" : undefined
              }
            >
              {goalsLoadingChip ? (
                <span className={styles.hubStatGoalsLoadingText}>
                  Calculating verified goals…
                </span>
              ) : (
                value
              )}
            </div>
            <div className={styles.hubStatLbl}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

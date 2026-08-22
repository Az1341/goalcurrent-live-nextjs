/**
 * Pure lineup-readiness classification shared by competitions that render
 * LiveMatchDashboard. A match is only CONFIRMED when both starting XIs are
 * present; one-sided provider data is PARTIAL rather than fabricated as full.
 */
import type { MatchLineupSide } from "@/types/match-detail";

export type LineupReadinessStatus = "CONFIRMED" | "PARTIAL" | "PENDING";

export function isLineupSideConfirmed(side: MatchLineupSide | null): boolean {
  return Boolean(side && side.startXI.length > 0);
}

export function resolveLineupReadiness(
  home: MatchLineupSide | null,
  away: MatchLineupSide | null,
): LineupReadinessStatus {
  const homeReady = isLineupSideConfirmed(home);
  const awayReady = isLineupSideConfirmed(away);
  if (homeReady && awayReady) return "CONFIRMED";
  if (homeReady || awayReady) return "PARTIAL";
  return "PENDING";
}

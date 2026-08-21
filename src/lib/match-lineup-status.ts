/**
 * Pure lineup-readiness classification, shared by every competition that
 * renders `LiveMatchDashboard` (Premier League, Community Shield, ...).
 *
 * DKAMS-GC-PL-LINEUP-READINESS-20260821-192822: the dashboard previously
 * labelled a match "CONFIRMED" whenever either side object was truthy,
 * which mislabels a one-sided or malformed (empty startXI) provider
 * response as fully confirmed. A side only counts as confirmed once the
 * provider has mapped it to a team with a non-empty starting XI.
 */
import type { MatchLineupSide } from "@/types/match-detail";

export type LineupReadinessStatus = "CONFIRMED" | "PARTIAL" | "PENDING";

/** A side is confirmed only when it has a verified, non-empty starting XI. */
export function isLineupSideConfirmed(side: MatchLineupSide | null): boolean {
  return Boolean(side && side.startXI.length > 0);
}

/**
 * Match-level readiness. Only CONFIRMED when both sides are confirmed;
 * a single confirmed side is PARTIAL, never fabricated as fully confirmed.
 */
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

/**
 * UCL data contract — stage / status mapping and availability rules.
 * Deliberately separate from Premier League matchweek assumptions.
 */

import type { UclFixtureStatus, UclStageKind } from "@/lib/ucl/types";

export function mapUclFixtureStatus(short: string): UclFixtureStatus {
  const code = short.trim().toUpperCase();
  if (code === "PEN") return "PEN";
  if (code === "AET") return "AET";
  if (code === "FT") return "FT";
  if (
    code === "1H" ||
    code === "2H" ||
    code === "HT" ||
    code === "ET" ||
    code === "BT" ||
    code === "P" ||
    code === "INT" ||
    code === "LIVE"
  ) {
    return "LIVE";
  }
  if (code === "PST") return "POSTPONED";
  if (code === "CANC" || code === "ABD" || code === "AWD" || code === "WO") {
    return "CANCELLED";
  }
  return "UPCOMING";
}

export function mapUclStage(round: string | null | undefined): UclStageKind {
  if (!round) return "other";
  const r = round.toLowerCase();
  if (r.includes("league stage") || r.includes("league phase")) return "league_phase";
  if (r.includes("qualif") || r.includes("preliminary")) return "qualification";
  if (r.includes("play-off") || r.includes("playoff") || r.includes("knockout play")) {
    return "playoff";
  }
  if (r.includes("round of 16") || r.includes("1/8")) return "round_of_16";
  if (r.includes("quarter") || r.includes("1/4")) return "quarter_final";
  if (r.includes("semi") || r.includes("1/2")) return "semi_final";
  if (r.includes("final") && !r.includes("semi")) return "final";
  return "other";
}

export function isFinishedUclStatus(status: UclFixtureStatus): boolean {
  return status === "FT" || status === "AET" || status === "PEN";
}

export function isLiveUclStatus(status: UclFixtureStatus): boolean {
  return status === "LIVE";
}

export function uclStandingsSupported(standingsCount: number, source: string): boolean {
  return standingsCount > 0 && source === "api-football";
}

/** Sanitised client-facing errors — never raw upstream payloads. */
export function sanitiseUclProviderError(message: string | undefined): string {
  if (!message) return "Champions League data is temporarily unavailable.";
  const lower = message.toLowerCase();
  if (lower.includes("rate") || lower.includes("429")) {
    return "Champions League data is rate-limited. Please try again shortly.";
  }
  if (lower.includes("key") || lower.includes("auth") || lower.includes("token")) {
    return "Champions League data is not configured on this server.";
  }
  return "Champions League data is temporarily unavailable.";
}
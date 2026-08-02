/**
 * UNL data contract — status mapping, group guards, and client-safe errors.
 */

import { UNL_GROUP_IDS, type UnlGroupId } from "@/lib/unl/constants";
import type { UnlFixtureRow, UnlFixtureStatus } from "@/lib/unl/types";

export function mapUnlFixtureStatus(short: string): UnlFixtureStatus {
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
  if (
    code === "NS" ||
    code === "TBD" ||
    code === "SUSP" ||
    code === "UPCOMING"
  ) {
    return "UPCOMING";
  }
  return "UPCOMING";
}

export function isFinishedUnlStatus(status: UnlFixtureStatus): boolean {
  return status === "FT" || status === "AET" || status === "PEN";
}

export function isLiveUnlStatus(status: UnlFixtureStatus): boolean {
  return status === "LIVE";
}

export function isUnlGroupId(value: string): value is UnlGroupId {
  return (UNL_GROUP_IDS as readonly string[]).includes(value);
}

/** Sanitised client-facing errors — never raw upstream payloads. */
export function sanitiseUnlProviderError(message: string | undefined): string {
  if (!message) return "Nations League data is temporarily unavailable.";
  const lower = message.toLowerCase();
  if (lower.includes("rate") || lower.includes("429")) {
    return "Nations League data is rate-limited. Please try again shortly.";
  }
  if (lower.includes("key") || lower.includes("auth") || lower.includes("token")) {
    return "Nations League data is not configured on this server.";
  }
  return "Nations League data is temporarily unavailable.";
}

export function filterUnlFixturesByGroup(
  fixtures: UnlFixtureRow[],
  groupId: string,
): UnlFixtureRow[] {
  if (!isUnlGroupId(groupId)) return [];
  return fixtures.filter((row) => row.groupId === groupId);
}
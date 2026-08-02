/**
 * Premier League 2026/27 clubs SSOT for private-preview / no-key environments.
 * Derived from the official Premier League 2026/27 fixture release (19 Jun 2026).
 */

import clubsPayload from "@/data/pl/clubs-2026-27.json";
import type { PlTeamRow } from "@/lib/pl/types";

export function getPlSsotTeams(): PlTeamRow[] {
  return [...(clubsPayload.teams as PlTeamRow[])].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function getPlSsotTeamsMeta(): {
  source: string;
  sourceUrl: string;
  count: number;
} {
  return {
    source: clubsPayload.source,
    sourceUrl: clubsPayload.sourceUrl,
    count: clubsPayload.count,
  };
}
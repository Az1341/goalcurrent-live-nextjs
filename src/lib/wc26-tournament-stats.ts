import { WC26_TOURNAMENT } from "@/data/wc26";
import { getEffectiveFixtures } from "@/lib/wc26-fixture-overlay";
import type { FixtureStatus } from "@/types/fixture";

const COMPLETED_STATUSES = new Set([
  "ft",
  "finished",
  "completed",
  "full-time",
  "aet",
  "pen",
]);

function normalizeStatus(status: string): string {
  return status.trim().toLowerCase();
}

/** True when a fixture status represents a completed match. */
export function isCompletedMatchStatus(status: FixtureStatus | string): boolean {
  return COMPLETED_STATUSES.has(normalizeStatus(status));
}

type FixtureWithStatus = { status: FixtureStatus | string };

/** Count of finished tournament matches in the loaded fixture dataset. */
export function getGamesPlayed(
  fixtures: readonly FixtureWithStatus[] = getEffectiveFixtures(),
): number {
  return fixtures.filter((fixture) => isCompletedMatchStatus(fixture.status))
    .length;
}

/** Remaining tournament matches: 104 minus completed. Zero when archive is complete. */
export function getGamesLeftToPlay(
  fixtures: readonly FixtureWithStatus[] = getEffectiveFixtures(),
): number {
  const played = getGamesPlayed(fixtures);
  const remaining = Math.max(WC26_TOURNAMENT.fixtureCount - played, 0);
  return played >= WC26_TOURNAMENT.fixtureCount ? 0 : remaining;
}

export function getTournamentCompletionSummary(
  fixtures: readonly FixtureWithStatus[] = getEffectiveFixtures(),
): {
  readonly played: number;
  readonly remaining: number;
  readonly total: number;
  readonly complete: boolean;
} {
  const played = getGamesPlayed(fixtures);
  const total = WC26_TOURNAMENT.fixtureCount;
  const remaining = getGamesLeftToPlay(fixtures);
  return {
    played,
    remaining,
    total,
    complete: played >= total,
  };
}

/** Sum of all goals from fixtures that have home+away scores in the overlay.
 *  Works from archive overlay data only. */
export function getTotalGoalsFromOverlay(
  fixtures: readonly (FixtureWithStatus & { homeScore?: number; awayScore?: number })[] = getEffectiveFixtures() as never,
): number {
  let total = 0;
  for (const f of fixtures) {
    if (typeof f.homeScore === "number" && typeof f.awayScore === "number") {
      total += f.homeScore + f.awayScore;
    }
  }
  return total;
}

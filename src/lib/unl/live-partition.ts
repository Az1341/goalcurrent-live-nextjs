import { isFinishedUnlStatus } from "@/lib/unl/contract";
import type { UnlFixtureRow } from "@/lib/unl/types";

export type UnlLiveBuckets = {
  live: UnlFixtureRow[];
  today: UnlFixtureRow[];
  upcoming: UnlFixtureRow[];
  completed: UnlFixtureRow[];
};

function localDateKey(date: Date): string {
  return date.toLocaleDateString();
}

function kickoffMs(row: UnlFixtureRow): number {
  const ms = new Date(row.kickoffUtc).getTime();
  return Number.isNaN(ms) ? Number.POSITIVE_INFINITY : ms;
}

/**
 * Partition UNL fixtures for the Live Match Centre sibling panel.
 * today = UPCOMING kickoffs on the viewer's local calendar day.
 */
export function partitionUnlFixturesForLive(
  fixtures: readonly UnlFixtureRow[],
  now: Date = new Date(),
): UnlLiveBuckets {
  const todayKey = localDateKey(now);
  const live: UnlFixtureRow[] = [];
  const today: UnlFixtureRow[] = [];
  const upcoming: UnlFixtureRow[] = [];
  const completed: UnlFixtureRow[] = [];

  for (const row of fixtures) {
    if (row.status === "LIVE") {
      live.push(row);
      continue;
    }
    if (isFinishedUnlStatus(row.status)) {
      completed.push(row);
      continue;
    }
    if (row.status === "UPCOMING") {
      const kick = new Date(row.kickoffUtc);
      if (!Number.isNaN(kick.getTime()) && localDateKey(kick) === todayKey) {
        today.push(row);
      } else {
        upcoming.push(row);
      }
    }
  }

  live.sort((a, b) => kickoffMs(a) - kickoffMs(b));
  today.sort((a, b) => kickoffMs(a) - kickoffMs(b));
  upcoming.sort((a, b) => kickoffMs(a) - kickoffMs(b));
  completed.sort((a, b) => kickoffMs(b) - kickoffMs(a));

  return {
    live,
    today,
    upcoming: upcoming.slice(0, 20),
    completed: completed.slice(0, 20),
  };
}

/** a1 → /nations-league/league/a/group/1 */
export function unlGroupHrefFromGroupId(groupId: string): string {
  const league = groupId.slice(0, 1).toLowerCase();
  const n = groupId.slice(1);
  return `/nations-league/league/${league}/group/${n}`;
}
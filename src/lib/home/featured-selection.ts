import { isWc26TournamentComplete } from "@/lib/wc26/archive";
import type { EffectiveFixture } from "@/lib/wc26-fixture-overlay";
import type { PlFixtureRow } from "@/lib/pl/types";
import { isCompletedMatchStatus } from "@/lib/wc26-tournament-stats";
import {
  buildHomepageMatchView,
  selectFeaturedFixtures,
  type FeaturedFixtureSelection,
  type HomepageMatchView,
} from "@/lib/wc26-live";

/** Featured slots must be live or genuinely upcoming — never completed archive rows. */
export function isFeaturedMatchEligible(view: HomepageMatchView): boolean {
  return view.matchClass === "live" || view.matchClass === "upcoming";
}

/** Earliest Premier League fixture still scheduled after `nowMs` (by kickoffUtc). */
export function selectNextPlUpcomingFixture(
  plFixtures: readonly PlFixtureRow[],
  nowMs: number = Date.now(),
): PlFixtureRow | undefined {
  const upcoming = plFixtures
    .filter(
      (f) =>
        f.status === "UPCOMING" &&
        Number.isFinite(new Date(f.kickoffUtc).getTime()) &&
        new Date(f.kickoffUtc).getTime() >= nowMs,
    )
    .sort(
      (a, b) =>
        new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime(),
    );
  return upcoming[0];
}

export function selectPlFeaturedFixture(
  plFixtures: readonly PlFixtureRow[],
): PlFixtureRow | undefined {
  const now = Date.now();
  const live = plFixtures.filter((f) => f.status === "LIVE");
  if (live.length) {
    return live.sort(
      (a, b) =>
        new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime(),
    )[0];
  }

  return selectNextPlUpcomingFixture(plFixtures, now);
}

export type HomeFeaturedContent = {
  readonly wc26Selection: FeaturedFixtureSelection;
  readonly featuredMatch?: HomepageMatchView;
  readonly plFeatured?: PlFixtureRow;
};

/** Archive-aware featured selection for homepage and JSON-LD. */
export function selectHomeFeaturedContent(
  wc26Fixtures: readonly EffectiveFixture[],
  plFixtures: readonly PlFixtureRow[] = [],
): HomeFeaturedContent {
  if (isWc26TournamentComplete()) {
    return {
      wc26Selection: { mode: "single", fixtures: [] },
      plFeatured: selectPlFeaturedFixture(plFixtures),
    };
  }

  const wc26Selection = selectFeaturedFixtures(wc26Fixtures, {
    allowCompletedFallback: false,
  });
  const seed = wc26Selection.fixtures[0];
  if (!seed) {
    return { wc26Selection, plFeatured: selectPlFeaturedFixture(plFixtures) };
  }

  const featuredMatch = buildHomepageMatchView(seed, wc26Fixtures);
  if (!isFeaturedMatchEligible(featuredMatch)) {
    return {
      wc26Selection: { mode: "single", fixtures: [] },
      plFeatured: selectPlFeaturedFixture(plFixtures),
    };
  }

  return { wc26Selection, featuredMatch };
}

/** True when a raw fixture status must never appear in upcoming sections. */
export function isUpcomingFixtureStatus(
  status: string,
  kickoffUtc: string,
  nowMs: number = Date.now(),
): boolean {
  if (isCompletedMatchStatus(status)) {
    return false;
  }
  const kickoffMs = new Date(kickoffUtc).getTime();
  return Number.isFinite(kickoffMs) && kickoffMs > nowMs;
}
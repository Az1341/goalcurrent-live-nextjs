/**
 * FA Cup constants (GC-COMP-FACUP-SPRINT-001).
 * Provider: API-Football / api-sports league id 45 (England FA Cup, v3).
 * Season year = starting year (2026/27 → 2026), aligned with PL/UCL project season.
 * Live /leagues verification unavailable locally (no API_FOOTBALL_KEY).
 */

export const FACUP_INTERNAL_KEY = "facup" as const;
export const FACUP_SLUG = "fa-cup" as const;
export const FACUP_DISPLAY_NAME = "FA Cup" as const;
export const FACUP_SHORT_NAME = "FA Cup" as const;
export const FACUP_NAV_LABEL = "FA Cup" as const;

/** api-sports England FA Cup id — stable across seasons on v3. */
export const FACUP_LEAGUE_ID = 45 as const;

/** 2026/27 cup season (starting year). */
export const FACUP_SEASON = 2026 as const;

export const FACUP_COMPETITION_TYPE = "knockout_cup" as const;

export const FACUP_SUPPORTED_SECTIONS = [
  "hub",
  "fixtures",
  "results",
] as const;

export const FACUP_HUB_PATH = `/${FACUP_SLUG}` as const;

export const FACUP_FIXTURES_CACHE_ACTIVE = 300;
export const FACUP_FIXTURES_CACHE_EMPTY = 3600;

/** Explicit dataset support flags — standings never presented for FA Cup. */
export const FACUP_DATASETS = {
  fixtures: true,
  results: true,
  standings: false,
  events: false,
  lineups: false,
  statistics: false,
} as const;
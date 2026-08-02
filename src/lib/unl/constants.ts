/**
 * UEFA Nations League constants (2026/27 league phase).
 * Provider: API-Football league id 5. Season starting year 2026 (2026/27).
 * Fixtures/groups SSOT is primary until live provider wiring is enabled.
 */

export const UNL_INTERNAL_KEY = "unl" as const;
export const UNL_SLUG = "nations-league" as const;
export const UNL_DISPLAY_NAME = "UEFA Nations League 26/27" as const;
export const UNL_SHORT_NAME = "UNL" as const;
export const UNL_NAV_LABEL = "Nations League 26/27" as const;
export const UNL_SEASON_LABEL = "26/27" as const;
export const UNL_LEAGUE_ID = 5 as const;
export const UNL_SEASON = 2026 as const;
export const UNL_COMPETITION_TYPE = "tournament" as const;
export const UNL_SUPPORTED_SECTIONS = [
  "hub",
  "fixtures",
  "results",
  "standings",
] as const;
export const UNL_HUB_PATH = `/${UNL_SLUG}` as const;

export const UNL_FIXTURES_CACHE_ACTIVE = 300;
export const UNL_FIXTURES_CACHE_EMPTY = 3600;
export const UNL_STANDINGS_CACHE_ACTIVE = 300;
export const UNL_STANDINGS_CACHE_UNAVAILABLE = 3600;

export const UNL_LEAGUES = ["a", "b", "c", "d"] as const;
export type UnlLeagueId = (typeof UNL_LEAGUES)[number];

export const UNL_GROUP_IDS = [
  "a1",
  "a2",
  "a3",
  "a4",
  "b1",
  "b2",
  "b3",
  "b4",
  "c1",
  "c2",
  "c3",
  "c4",
  "d1",
  "d2",
] as const;
export type UnlGroupId = (typeof UNL_GROUP_IDS)[number];
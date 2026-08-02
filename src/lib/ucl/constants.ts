/**
 * UEFA Champions League constants (GC-COMP-UCL-SPRINT-001).
 * Provider: API-Football league id 2 (official docs). Season starting year 2026 (2026/27).
 */

export const UCL_INTERNAL_KEY = "ucl" as const;
export const UCL_SLUG = "champions-league" as const;
export const UCL_DISPLAY_NAME = "UEFA Champions League 26/27" as const;
export const UCL_SHORT_NAME = "UCL" as const;
export const UCL_NAV_LABEL = "Champions League 26/27" as const;
export const UCL_SEASON_LABEL = "26/27" as const;
export const UCL_LEAGUE_ID = 2 as const;
export const UCL_SEASON = 2026 as const;
export const UCL_COMPETITION_TYPE = "cup" as const;
export const UCL_SUPPORTED_SECTIONS = [
  "hub",
  "fixtures",
  "results",
  "standings",
] as const;
export const UCL_HUB_PATH = `/${UCL_SLUG}` as const;
export const UCL_FIXTURES_CACHE_ACTIVE = 300;
export const UCL_FIXTURES_CACHE_EMPTY = 3600;
export const UCL_STANDINGS_CACHE_ACTIVE = 300;
export const UCL_STANDINGS_CACHE_UNAVAILABLE = 3600;
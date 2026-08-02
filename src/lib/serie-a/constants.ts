/**
 * Serie A (Italy) — API-Football provider constants.
 *
 * SERIEA_LEAGUE_ID 135 — confirmed via API-Football /leagues endpoint
 * (search=Serie A, country=Italy on v3.football.api-sports.io; id 135 = Serie A).
 * Season 2026 = 2026/27 (starting-year convention).
 */

export const SERIEA_LEAGUE_ID = 135 as const;
export const SERIEA_SEASON = 2026 as const;
export const SERIEA_SEASON_LABEL = "26/27" as const;
export const SERIEA_LEAGUE_NAME = "Serie A" as const;
export const SERIEA_DISPLAY_NAME = "Serie A 26/27" as const;
export const SERIEA_HUB_PATH = "/serie-a" as const;

export const SERIEA_STANDINGS_CACHE_ACTIVE = 300;
export const SERIEA_STANDINGS_CACHE_PRESEASON = 3600;
export const SERIEA_FIXTURES_CACHE_ACTIVE = 300;
export const SERIEA_FIXTURES_CACHE_PRESEASON = 3600;

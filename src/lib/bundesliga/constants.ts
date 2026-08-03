/**
 * Bundesliga (Germany) — API-Football provider constants.
 *
 * BUNDESLIGA_LEAGUE_ID 78 — confirmed via API-Football /leagues endpoint
 * (search=Bundesliga, country=Germany on v3.football.api-sports.io; id 78 = Bundesliga).
 * Season 2026 = 2026/27 (starting-year convention).
 */

export const BUNDESLIGA_LEAGUE_ID = 78 as const;
export const BUNDESLIGA_SEASON = 2026 as const;
export const BUNDESLIGA_SEASON_LABEL = "26/27" as const;
export const BUNDESLIGA_LEAGUE_NAME = "Bundesliga" as const;
export const BUNDESLIGA_DISPLAY_NAME = "Bundesliga 26/27" as const;
export const BUNDESLIGA_HUB_PATH = "/bundesliga" as const;

export const BUNDESLIGA_STANDINGS_CACHE_ACTIVE = 300;
export const BUNDESLIGA_STANDINGS_CACHE_PRESEASON = 3600;
export const BUNDESLIGA_FIXTURES_CACHE_ACTIVE = 300;
export const BUNDESLIGA_FIXTURES_CACHE_PRESEASON = 3600;

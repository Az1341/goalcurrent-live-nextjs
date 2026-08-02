/**
 * La Liga (Spain) — API-Football provider constants.
 *
 * LALIGA_LEAGUE_ID 140 — confirmed via API-Football official docs
 * (https://www.api-football.com/news/post/how-to-get-started-with-api-football):
 * league IDs are stable; La Liga is always 140 on v3.football.api-sports.io.
 * Season 2026 = 2026/27 (starting-year convention).
 */

export const LALIGA_LEAGUE_ID = 140 as const;
export const LALIGA_SEASON = 2026 as const;
export const LALIGA_SEASON_LABEL = "26/27" as const;
export const LALIGA_LEAGUE_NAME = "La Liga" as const;
export const LALIGA_DISPLAY_NAME = "La Liga 26/27" as const;
export const LALIGA_HUB_PATH = "/la-liga" as const;

export const LALIGA_STANDINGS_CACHE_ACTIVE = 300;
export const LALIGA_STANDINGS_CACHE_PRESEASON = 3600;
export const LALIGA_FIXTURES_CACHE_ACTIVE = 300;
export const LALIGA_FIXTURES_CACHE_PRESEASON = 3600;

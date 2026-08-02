export const PL_LEAGUE_ID = 39 as const;
export const PL_SEASON = 2026 as const;
export const PL_SEASON_LABEL = "26/27" as const;
export const PL_LEAGUE_NAME = "Premier League" as const;
export const PL_DISPLAY_NAME = "Premier League 26/27" as const;

/** Official season opener: Arsenal v Coventry, 20:00 BST Fri 21 Aug 2026. */
export const PL_SEASON_START_ISO = "2026-08-21T19:00:00.000Z";

/** Synthetic SSOT fixture id range (not API-Football match centre ids). */
export const PL_SSOT_FIXTURE_ID_MIN = 926_270_001;
export const PL_SSOT_FIXTURE_ID_MAX = 926_270_380;

export function isPlSsotFixtureId(fixtureId: number): boolean {
  return (
    Number.isFinite(fixtureId) &&
    fixtureId >= PL_SSOT_FIXTURE_ID_MIN &&
    fixtureId <= PL_SSOT_FIXTURE_ID_MAX
  );
}

export const API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io";

/** Standings endpoint cache when season has started (seconds). */
export const PL_STANDINGS_CACHE_ACTIVE = 300;

/** Standings endpoint cache pre-season / empty (seconds). */
export const PL_STANDINGS_CACHE_PRESEASON = 3600;

/** Fixtures endpoint cache when season has started (seconds). */
export const PL_FIXTURES_CACHE_ACTIVE = 300;

/** Fixtures endpoint cache pre-season / empty (seconds). */
export const PL_FIXTURES_CACHE_PRESEASON = 3600;

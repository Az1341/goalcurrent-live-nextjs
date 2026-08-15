/** FA Community Shield 2026 — isolated PL-pattern trial constants. */

export const COMMUNITY_SHIELD_COMPETITION = "FA Community Shield";
export const COMMUNITY_SHIELD_SEASON = 2026;
export const COMMUNITY_SHIELD_PATH = "/community-shield";
export const COMMUNITY_SHIELD_LEAGUE_ID = 528;

/**
 * Real API-Football fixture id for Arsenal vs Manchester City,
 * FA Community Shield, Principality Stadium, 2026-08-16 14:00 UTC.
 * Confirmed via API-Sports-backed listing (league 528 / fixture 1582365).
 */
export const COMMUNITY_SHIELD_FIXTURE_ID = 1_582_365;

export function isCommunityShieldFixtureId(fixtureId: number): boolean {
  return fixtureId === COMMUNITY_SHIELD_FIXTURE_ID;
}

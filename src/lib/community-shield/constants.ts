/** FA Community Shield 2026 — isolated PL-pattern trial constants. */

export const COMMUNITY_SHIELD_COMPETITION = "FA Community Shield";
export const COMMUNITY_SHIELD_SEASON = 2026;
export const COMMUNITY_SHIELD_PATH = "/community-shield";

/** Outside PL SSOT range (926270001–926270380) and WC26 string fixture IDs. */
export const COMMUNITY_SHIELD_FIXTURE_ID_MIN = 880_160_001;
export const COMMUNITY_SHIELD_FIXTURE_ID_MAX = 880_160_099;

export function isCommunityShieldFixtureId(fixtureId: number): boolean {
  return (
    fixtureId >= COMMUNITY_SHIELD_FIXTURE_ID_MIN &&
    fixtureId <= COMMUNITY_SHIELD_FIXTURE_ID_MAX
  );
}

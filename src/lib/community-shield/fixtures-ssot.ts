/**
 * FA Community Shield 2026 fixture SSOT.
 * Static JSON seeded from the confirmed API-Football fixture record.
 */

import fixturesPayload from "@/data/community-shield/fixtures-2026.json";
import type { CommunityShieldFixtureRow } from "@/lib/community-shield/types";

export {
  isCommunityShieldFixtureId,
  COMMUNITY_SHIELD_FIXTURE_ID,
} from "@/lib/community-shield/constants";

export function getCommunityShieldFixtures(): CommunityShieldFixtureRow[] {
  return [...(fixturesPayload.fixtures as CommunityShieldFixtureRow[])];
}

/** Single-fixture reader for the 2026 Community Shield final. */
export function getCommunityShieldFixture(): CommunityShieldFixtureRow | null {
  return getCommunityShieldFixtures()[0] ?? null;
}

export function getCommunityShieldSsotMeta(): {
  source: string;
  sourceUrl: string;
  count: number;
  competition: string;
  season: number;
} {
  return {
    source: fixturesPayload.source,
    sourceUrl: fixturesPayload.sourceUrl,
    count: fixturesPayload.count,
    competition: fixturesPayload.competition,
    season: fixturesPayload.season,
  };
}

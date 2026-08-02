/**
 * Premier League 2026/27 fixture SSOT for private-preview / no-key environments.
 * Source: official Premier League fixture release (19 Jun 2026).
 */

import fixturesPayload from "@/data/pl/fixtures-2026-27.json";
import { resolvePlBroadcasterFromLocale } from "@/lib/pl/pl-broadcasters";
import type { PlFixtureRow } from "@/lib/pl/types";

export {
  isPlSsotFixtureId,
  PL_SSOT_FIXTURE_ID_MAX,
  PL_SSOT_FIXTURE_ID_MIN,
} from "@/lib/pl/constants";

type SsotFixture = Omit<PlFixtureRow, "broadcaster">;

export function getPlSsotFixtures(locale = "en-GB"): PlFixtureRow[] {
  const rows = (fixturesPayload.fixtures as SsotFixture[]).map((row) => ({
    ...row,
    broadcaster: resolvePlBroadcasterFromLocale(locale),
  }));
  return rows.sort(
    (a, b) =>
      new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime(),
  );
}

export function getPlSsotMeta(): {
  source: string;
  sourceUrl: string;
  count: number;
} {
  return {
    source: fixturesPayload.source,
    sourceUrl: fixturesPayload.sourceUrl,
    count: fixturesPayload.count,
  };
}
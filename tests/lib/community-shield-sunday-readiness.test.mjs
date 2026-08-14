import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("Community Shield match detail API is fixture-bound and exposes match-day data", () => {
  const constants = read("src/lib/community-shield/constants.ts");
  const detail = read("src/lib/community-shield/match-detail.ts");
  const route = read("src/app/api/community-shield/match/[fixtureId]/route.ts");

  assert.match(constants, /COMMUNITY_SHIELD_LEAGUE_ID\s*=\s*528/);
  assert.match(constants, /COMMUNITY_SHIELD_FIXTURE_ID\s*=\s*1_582_365/);
  assert.match(detail, /isCommunityShieldFixtureId\(fixtureId\)/);
  assert.match(detail, /\/fixtures\/lineups\?fixture=/);
  assert.match(detail, /\/fixtures\/statistics\?fixture=/);
  assert.match(detail, /\/fixtures\/events\?fixture=/);
  assert.match(route, /fetchCommunityShieldMatchDetail\(fixtureId\)/);
});

test("Community Shield hub renders line-ups statistics and match events", () => {
  const client = read("src/components/community-shield/CommunityShieldHubClient.tsx");
  assert.match(client, /Line-ups/);
  assert.match(client, /Match statistics/);
  assert.match(client, /Match events/);
  assert.match(client, /\/api\/community-shield\/match\//);
  assert.match(client, /refreshInterval:\s*30_000/);
});

test("home countdown prioritises Community Shield then falls back to Premier League", () => {
  const countdown = read("src/components/home/v5/HomePlKickoffCountdown.tsx");
  assert.match(countdown, /useCommunityShieldFixture\(\)/);
  assert.match(countdown, /COMMUNITY_SHIELD_DISPLAY_TAIL_MS/);
  assert.match(countdown, /selectNextPlUpcomingFixture\(plFixtures, nowMs\)/);
  assert.match(countdown, /href:\s*["']\/community-shield["']/);
});

test("mobile bottom nav has direct Competitions access and Community Shield is in the sheet", () => {
  const bottom = read("src/components/layout/BottomTabBar.tsx");
  const sheet = read("src/components/layout/MobileCompetitionsSheet.tsx");
  const nav = read("src/lib/nav.ts");

  assert.match(bottom, /MobileCompetitionsSheet/);
  assert.match(bottom, /gc-mobile-competitions-sheet/);
  assert.match(sheet, /DESKTOP_COMPETITIONS_NAV\.map/);
  assert.match(nav, /id:\s*["']comshield["']/);
  assert.match(nav, /href:\s*["']\/community-shield["']/);
});

test("owned house ad uses UTM-only attribution and no identifier parameters", () => {
  const promo = read("src/components/home/v5/HomeEcosystemPromo.tsx");
  assert.match(promo, /utm_source=goalcurrent/);
  assert.match(promo, /utm_medium=owned/);
  assert.match(promo, /utm_campaign=ashna4all_ecosystem/);
  assert.doesNotMatch(promo, /[?&](email|user_id|uid|phone|device_id)=/i);
  assert.match(promo, /no behavioural targeting/i);
});

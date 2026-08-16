import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("Community Shield and Premier League match centres use the shared live dashboard", () => {
  const shield = read("src/components/community-shield/CommunityShieldHubClient.tsx");
  const pl = read("src/components/pl/PlMatchClient.tsx");
  const dashboard = read("src/components/match/LiveMatchDashboard.tsx");

  assert.match(shield, /LiveMatchDashboard/);
  assert.match(shield, /favouriteMatchId=\{`cs:\$\{fixture\.fixtureId\}`\}/);
  assert.match(pl, /LiveMatchDashboard/);
  assert.match(pl, /favouriteMatchId=\{`pl:\$\{fixture\.fixtureId\}`\}/);
  assert.match(dashboard, /data-gc-live-match-dashboard/);
  assert.match(dashboard, /Match events/);
  assert.match(dashboard, /Tactical view/);
  assert.match(dashboard, /Key stats/);
});

test("live dashboard never fabricates momentum or player coordinates", () => {
  const dashboard = read("src/components/match/LiveMatchDashboard.tsx");
  assert.doesNotMatch(dashboard, /momentum/i);
  assert.doesNotMatch(dashboard, /grid_position|left:\s*.*player|top:\s*.*player/i);
});

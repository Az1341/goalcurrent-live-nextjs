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
  assert.match(dashboard, /Event Timeline/);
  assert.match(dashboard, /Tactical view/);
  assert.match(dashboard, /Match Stats/);
});

test("Stitch match centre keeps the three-panel desktop composition", () => {
  const dashboard = read("src/components/match/LiveMatchDashboard.tsx");
  const css = read("src/components/match/LiveMatchDashboard.module.css");

  assert.match(dashboard, /leftPanel/);
  assert.match(dashboard, /centerStage/);
  assert.match(dashboard, /rightRail/);
  assert.match(css, /grid-template-columns:\s*300px minmax\(0, 1fr\) 320px/);
  assert.match(css, /backdrop-filter:\s*blur\(14px\)/);
});

test("Premier League match page contains only the live Stitch match centre after loading", () => {
  const pl = read("src/components/pl/PlMatchClient.tsx");
  assert.doesNotMatch(pl, /Head to head/);
  assert.doesNotMatch(pl, /League table snapshot/);
  assert.doesNotMatch(pl, /Add to Google Calendar/);
  assert.match(pl, /LiveMatchDashboard/);
});

test("live dashboard never fabricates momentum or player coordinates", () => {
  const dashboard = read("src/components/match/LiveMatchDashboard.tsx");
  assert.doesNotMatch(dashboard, /momentum/i);
  assert.doesNotMatch(dashboard, /grid_position|left:\s*.*player|top:\s*.*player/i);
});

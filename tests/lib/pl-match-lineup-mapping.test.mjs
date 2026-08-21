import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// DKAMS-GC-PL-LINEUP-READINESS-20260821-192822
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { resolveLineupSides } = await import(
  pathToFileURL(join(root, "src/lib/pl/match-detail.ts")).href
);

const HOME_TEAM_ID = 42; // Arsenal
const AWAY_TEAM_ID = 1346; // Coventry

function providerRow(teamId, teamName, playerCount = 11) {
  return {
    team: { id: teamId, name: teamName, logo: `https://example.test/${teamId}.png` },
    coach: { name: `${teamName} coach` },
    formation: "4-3-3",
    startXI: Array.from({ length: playerCount }, (_, index) => ({
      player: { id: index + 1, name: `${teamName} Player ${index + 1}`, number: index + 1, pos: "MF" },
    })),
    substitutes: [],
  };
}

test("valid two-team provider lineup maps to correct home/away sides", () => {
  const rows = [providerRow(HOME_TEAM_ID, "Arsenal"), providerRow(AWAY_TEAM_ID, "Coventry")];
  const { home, away } = resolveLineupSides(rows, HOME_TEAM_ID, AWAY_TEAM_ID);
  assert.equal(home?.teamName, "Arsenal");
  assert.equal(away?.teamName, "Coventry");
  assert.equal(home?.startXI.length, 11);
  assert.equal(away?.startXI.length, 11);
});

test("reversed provider row order still maps correctly by team id", () => {
  // Away team listed first — common when the provider does not guarantee order.
  const rows = [providerRow(AWAY_TEAM_ID, "Coventry"), providerRow(HOME_TEAM_ID, "Arsenal")];
  const { home, away } = resolveLineupSides(rows, HOME_TEAM_ID, AWAY_TEAM_ID);
  assert.equal(home?.teamName, "Arsenal");
  assert.equal(away?.teamName, "Coventry");
});

test("reversed rows without a team-id match still fall back to positional mapping for exactly two rows", () => {
  // Simulates a provider payload where team ids are absent/mismatched but
  // exactly two rows are present — GoalCurrent must not drop the data.
  const rows = [providerRow(999999, "Coventry"), providerRow(888888, "Arsenal")];
  const { home, away } = resolveLineupSides(rows, HOME_TEAM_ID, AWAY_TEAM_ID);
  assert.equal(home?.teamName, "Coventry");
  assert.equal(away?.teamName, "Arsenal");
});

test("empty provider lineup rows resolve to null on both sides", () => {
  const { home, away } = resolveLineupSides([], HOME_TEAM_ID, AWAY_TEAM_ID);
  assert.equal(home, null);
  assert.equal(away, null);
});

test("one-sided provider payload maps only the reported team", () => {
  const rows = [providerRow(HOME_TEAM_ID, "Arsenal")];
  const { home, away } = resolveLineupSides(rows, HOME_TEAM_ID, AWAY_TEAM_ID);
  assert.equal(home?.teamName, "Arsenal");
  assert.equal(away, null);
});

test("malformed row with an empty startXI still maps the side, leaving readiness classification to the status layer", () => {
  const malformedHome = providerRow(HOME_TEAM_ID, "Arsenal", 0);
  const rows = [malformedHome, providerRow(AWAY_TEAM_ID, "Coventry")];
  const { home, away } = resolveLineupSides(rows, HOME_TEAM_ID, AWAY_TEAM_ID);
  assert.equal(home?.teamName, "Arsenal");
  assert.equal(home?.startXI.length, 0);
  assert.equal(away?.startXI.length, 11);
});

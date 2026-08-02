import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function loadJson(rel) {
  return JSON.parse(readFileSync(join(root, rel), "utf8"));
}

test("UNL SSOT: 14 groups, 54 teams, 156 fixtures", () => {
  const groupsPayload = loadJson("src/data/unl/groups-2026-27.json");
  const fixturesPayload = loadJson("src/data/unl/fixtures-2026-27.json");

  assert.equal(groupsPayload.groups.length, 14);

  const teamIds = new Set();
  for (const group of groupsPayload.groups) {
    for (const team of group.teams) {
      teamIds.add(team.teamId);
    }
  }
  assert.equal(teamIds.size, 54);

  assert.equal(fixturesPayload.fixtures.length, 156);
  assert.equal(fixturesPayload.count, 156);
});

test("UNL SSOT: sample CET 2026-09-24 20:45 converts to UTC hour 18 (CEST)", () => {
  const fixturesPayload = loadJson("src/data/unl/fixtures-2026-27.json");
  const sample = fixturesPayload.fixtures.find(
    (row) =>
      row.kickoffCet === "2026-09-24 20:45" ||
      (String(row.kickoffCet || "").includes("2026-09-24") &&
        String(row.kickoffCet || "").includes("20:45")),
  );
  assert.ok(sample, "expected a fixture with kickoffCet 2026-09-24 20:45");
  const utc = new Date(sample.kickoffUtc);
  assert.equal(utc.getUTCFullYear(), 2026);
  assert.equal(utc.getUTCMonth(), 8); // September
  assert.equal(utc.getUTCDate(), 24);
  assert.equal(utc.getUTCHours(), 18);
  assert.equal(utc.getUTCMinutes(), 45);
});
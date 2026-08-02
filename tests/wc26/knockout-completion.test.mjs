import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { isEffectiveFixtureCompleted } = await import(
  pathToFileURL(join(root, "src/lib/wc26-fixture-overlay.ts")).href
);

function knockoutFx(overrides = {}) {
  return {
    id: "fixture-ko-1",
    homeTeamId: "bra",
    awayTeamId: "arg",
    venueId: "miami",
    kickoffUtc: "2020-01-01T20:00:00.000Z",
    status: "2h",
    stage: "round_of_16",
    matchNumber: 50,
    homeScore: 1,
    awayScore: 0,
    elapsed: 95,
    apiFixtureId: 99901,
    ...overrides,
  };
}

test("FE-006: scored live knockout is not completed", () => {
  assert.equal(isEffectiveFixtureCompleted(knockoutFx({ status: "2h" })), false);
  assert.equal(isEffectiveFixtureCompleted(knockoutFx({ status: "1h", elapsed: 44 })), false);
  assert.equal(isEffectiveFixtureCompleted(knockoutFx({ status: "et", elapsed: 105 })), false);
  assert.equal(
    isEffectiveFixtureCompleted(knockoutFx({ status: "penalties", elapsed: 120 })),
    false,
  );
});

test("FE-006: stoppage elapsed alone does not complete knockout", () => {
  assert.equal(
    isEffectiveFixtureCompleted(knockoutFx({ status: "2h", elapsed: 90, apiFixtureId: 1 })),
    false,
  );
});

test("FE-006: provider-confirmed completion statuses remain completed", () => {
  for (const status of ["ft", "aet", "pen", "finished", "completed"]) {
    assert.equal(isEffectiveFixtureCompleted(knockoutFx({ status })), true, status);
  }
});

test("FE-006: postponed cancelled abandoned are not invented as completed", () => {
  assert.equal(
    isEffectiveFixtureCompleted(knockoutFx({ status: "postponed", homeScore: 0, awayScore: 0 })),
    false,
  );
  assert.equal(isEffectiveFixtureCompleted(knockoutFx({ status: "cancelled" })), false);
  assert.equal(
    isEffectiveFixtureCompleted(knockoutFx({ status: "cancelled", apiFixtureId: 1 })),
    false,
  );
});

test("FE-006: group-stage live with scores is not completed via kickoff heuristic", () => {
  assert.equal(
    isEffectiveFixtureCompleted({
      id: "fixture-g",
      homeTeamId: "eng",
      awayTeamId: "usa",
      venueId: "miami",
      kickoffUtc: "2020-01-01T15:00:00.000Z",
      status: "2h",
      stage: "group",
      groupId: "D",
      matchNumber: 10,
      homeScore: 2,
      awayScore: 1,
      elapsed: 70,
      apiFixtureId: 55,
    }),
    false,
  );
});
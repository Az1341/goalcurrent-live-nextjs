import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { mapApiStatusShort } = await import(
  pathToFileURL(join(root, "src/lib/wc26-fixture-match.ts")).href
);
const {
  isLiveMatchStatus,
  shouldShowLiveMatchCard,
  buildHomepageMatchView,
  formatCompactFixtureStatusLabel,
} = await import(pathToFileURL(join(root, "src/lib/wc26-live.ts")).href);

function fx(overrides = {}) {
  return {
    id: "fixture-status",
    homeTeamId: "bra",
    awayTeamId: "arg",
    venueId: "miami",
    kickoffUtc: "2099-01-01T20:00:00.000Z",
    status: "scheduled",
    stage: "group",
    groupId: "A",
    matchNumber: 1,
    ...overrides,
  };
}

test("provider contract: PST/CANC/ABD map and never count as live", () => {
  assert.equal(mapApiStatusShort("PST"), "postponed");
  assert.equal(mapApiStatusShort("CANC"), "cancelled");
  assert.equal(mapApiStatusShort("ABD"), "cancelled");
  for (const status of ["postponed", "cancelled", "pst", "canc", "abd"]) {
    assert.equal(isLiveMatchStatus(status), false);
    assert.equal(shouldShowLiveMatchCard(fx({ status })), false);
  }
  assert.equal(formatCompactFixtureStatusLabel("postponed"), "PST");
  assert.equal(formatCompactFixtureStatusLabel("cancelled"), "CANC");
});

test("provider contract: INT interrupted maps to live overlay status", () => {
  assert.equal(mapApiStatusShort("INT"), "live");
  assert.equal(isLiveMatchStatus("live"), true);
});

test("provider contract: unsupported SUSP short is not invented as live", () => {
  // API-Football SUSP is not in the WC26 overlay map; fallthrough lowercases.
  // Must not be classified as an in-play status.
  assert.equal(mapApiStatusShort("SUSP"), "susp");
  assert.equal(isLiveMatchStatus("susp"), false);
  assert.equal(shouldShowLiveMatchCard(fx({ status: "susp" })), false);
});

test("provider contract: scheduled kickoff-passed is not live", () => {
  const past = fx({
    kickoffUtc: "2020-01-01T12:00:00.000Z",
    status: "scheduled",
  });
  assert.equal(shouldShowLiveMatchCard(past), false);
  assert.equal(buildHomepageMatchView(past).matchClass, "upcoming");
});

test("provider contract: live and finished and penalty-finished", () => {
  assert.equal(mapApiStatusShort("LIVE"), "live");
  assert.equal(mapApiStatusShort("1H"), "1h");
  assert.equal(mapApiStatusShort("FT"), "ft");
  assert.equal(mapApiStatusShort("PEN"), "pen");
  assert.equal(isLiveMatchStatus("2h"), true);
  assert.equal(shouldShowLiveMatchCard(fx({ status: "2h", elapsed: 70 })), true);
  assert.equal(
    shouldShowLiveMatchCard(fx({ status: "ft", homeScore: 1, awayScore: 0 })),
    false,
  );
  assert.equal(formatCompactFixtureStatusLabel("pen"), "PEN");
  assert.equal(formatCompactFixtureStatusLabel("ft"), "FT");
});
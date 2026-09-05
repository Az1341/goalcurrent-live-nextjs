import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  findKnockoutPairing,
  loadConfirmedResults,
} from "./load-confirmed-results.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const confirmed = loadConfirmedResults(root);

function assertPairing(fixtureId, expected) {
  const pairing = findKnockoutPairing(confirmed, fixtureId);
  assert.ok(pairing, `missing pairing for ${fixtureId}`);
  assert.equal(pairing.matchNumber, expected.matchNumber);
  assert.equal(pairing.homeTeamId, expected.homeTeamId);
  assert.equal(pairing.awayTeamId, expected.awayTeamId);
}

test("confirmed knockout pairings SSOT includes R32 and round-of-16 slots", () => {
  assertPairing("fixture-075", { matchNumber: 75, homeTeamId: "ned", awayTeamId: "mar" });
  assertPairing("fixture-076", { matchNumber: 76, homeTeamId: "bra", awayTeamId: "jpn" });
  assertPairing("fixture-081", { matchNumber: 81, homeTeamId: "usa", awayTeamId: "bih" });
  assertPairing("fixture-082", { matchNumber: 82, homeTeamId: "bel", awayTeamId: "sen" });
  assertPairing("fixture-086", { matchNumber: 86, homeTeamId: "arg", awayTeamId: "cpv" });
  assertPairing("fixture-087", { matchNumber: 87, homeTeamId: "col", awayTeamId: "gha" });
  assertPairing("fixture-088", { matchNumber: 88, homeTeamId: "aus", awayTeamId: "egy" });
  assertPairing("fixture-077", { matchNumber: 77, homeTeamId: "fra", awayTeamId: "swe" });
  assertPairing("fixture-078", { matchNumber: 78, homeTeamId: "civ", awayTeamId: "nor" });
  assertPairing("fixture-084", { matchNumber: 84, homeTeamId: "esp", awayTeamId: "aut" });
});

test("resolveFixtureParticipant prefers confirmed pairing over bracket template", () => {
  const liveRaw = readFileSync(join(root, "src/lib/wc26-live.ts"), "utf8");
  assert.match(liveRaw, /getConfirmedKnockoutPairingByFixtureId/);
  assert.match(liveRaw, /skipBracketTemplate/);
});

test("results sync fills overlay team ids from confirmed pairings", () => {
  const raw = readFileSync(join(root, "src/lib/wc26-results-sync.ts"), "utf8");
  assert.match(raw, /confirmed\?\.homeTeamId \?\? match\.homeTeamId/);
});

test("bracket lineup bar resolves participants instead of tbd ids", () => {
  const raw = readFileSync(join(root, "src/components/wc26/bracket/BracketLiveLineupBar.tsx"), "utf8");
  assert.match(raw, /resolveFixtureParticipant/);
  assert.doesNotMatch(raw, /fixture\.homeTeamId/);
});

test("standings engine uses final tables after group stage", () => {
  const raw = readFileSync(join(root, "src/lib/wc26-standings.ts"), "utf8");
  assert.match(raw, /isWc26GroupStageComplete\(\)/);
  assert.match(raw, /WC26_FINAL_GROUP_STANDINGS/);
  assert.match(raw, /formatPendingWinnerFeederLabel/);
});

test("round of 16 feeder slots name participants before knockout is played", () => {
  const standings = readFileSync(join(root, "src/lib/wc26-standings.ts"), "utf8");
  const bracket = readFileSync(join(root, "src/lib/wc26/bracket-view.ts"), "utf8");
  const pairingsModule = readFileSync(join(root, "src/lib/wc26/knockout-confirmed-pairings.ts"), "utf8");
  const fifa = readFileSync(join(root, "src/lib/wc26/fifa-bracket-mapping.ts"), "utf8");
  assert.match(standings, /formatPendingWinnerFeederLabel/);
  assert.match(bracket, /feederParticipantsLabel/);
  assert.match(fifa, /matchNumber:\s*94[\s\S]*matchNumber:\s*81[\s\S]*matchNumber:\s*82/);
  assert.match(pairingsModule, /WC26_CONFIRMED_KNOCKOUT_PAIRINGS/);
  assertPairing("fixture-081", { matchNumber: 81, homeTeamId: "usa", awayTeamId: "bih" });
  assertPairing("fixture-082", { matchNumber: 82, homeTeamId: "bel", awayTeamId: "sen" });
});

test("retired WC26 provider wrapper is removed", () => {
  assert.throws(
    () => readFileSync(join(root, "src/lib/server/wc26-api-football.ts"), "utf8"),
    /ENOENT/,
  );
});
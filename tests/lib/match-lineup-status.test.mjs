import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// DKAMS-GC-PL-LINEUP-READINESS-20260821-192822
// Regression guard: the live dashboard previously labelled a match
// "CONFIRMED" as soon as either side object existed, which mislabelled a
// one-sided or malformed (empty startXI) provider response as fully
// confirmed. These tests fail against that old boolean-OR logic.
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { resolveLineupReadiness, isLineupSideConfirmed } = await import(
  pathToFileURL(join(root, "src/lib/match-lineup-status.ts")).href
);

function side(overrides = {}) {
  return {
    teamName: "Team",
    formation: "4-3-3",
    coach: "Coach",
    startXI: [{ name: "Player", number: 1, position: "GK" }],
    substitutes: [],
    ...overrides,
  };
}

test("empty provider lineup (both sides null) resolves to PENDING, not confirmed", () => {
  assert.equal(resolveLineupReadiness(null, null), "PENDING");
});

test("one-sided/partial lineup is reported as PARTIAL, not fabricated as CONFIRMED", () => {
  assert.equal(resolveLineupReadiness(side(), null), "PARTIAL");
  assert.equal(resolveLineupReadiness(null, side()), "PARTIAL");
});

test("malformed side with an empty starting XI is not marked confirmed", () => {
  const malformed = side({ startXI: [] });
  assert.equal(isLineupSideConfirmed(malformed), false);
  // Malformed home + a genuinely confirmed away side must read PARTIAL, never CONFIRMED.
  assert.equal(resolveLineupReadiness(malformed, side()), "PARTIAL");
  assert.equal(resolveLineupReadiness(malformed, null), "PENDING");
});

test("both sides confirmed with non-empty starting XIs resolves to CONFIRMED", () => {
  assert.equal(resolveLineupReadiness(side(), side()), "CONFIRMED");
});

test("isLineupSideConfirmed requires a non-empty startXI array", () => {
  assert.equal(isLineupSideConfirmed(null), false);
  assert.equal(isLineupSideConfirmed(side({ startXI: [] })), false);
  assert.equal(isLineupSideConfirmed(side()), true);
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const helperHref = pathToFileURL(join(root, "src/lib/match-lineup-status.ts")).href;
const { resolveLineupReadiness, isLineupSideConfirmed } = await import(helperHref);

function side(startXI) {
  return {
    teamId: "1",
    teamName: "Example FC",
    teamLogo: null,
    formation: null,
    coach: null,
    startXI,
    substitutes: [],
  };
}

const player = { name: "Player One", number: 1, position: "G" };

describe("strict lineup readiness", () => {
  it("returns PENDING when neither side has a starting XI", () => {
    assert.equal(resolveLineupReadiness(null, null), "PENDING");
    assert.equal(resolveLineupReadiness(side([]), side([])), "PENDING");
  });

  it("returns PARTIAL when only one side has a starting XI", () => {
    assert.equal(resolveLineupReadiness(side([player]), null), "PARTIAL");
    assert.equal(resolveLineupReadiness(side([]), side([player])), "PARTIAL");
  });

  it("returns CONFIRMED only when both sides have non-empty starting XIs", () => {
    assert.equal(resolveLineupReadiness(side([player]), side([player])), "CONFIRMED");
  });

  it("does not treat an empty side object as confirmed", () => {
    assert.equal(isLineupSideConfirmed(side([])), false);
    assert.equal(isLineupSideConfirmed(side([player])), true);
  });
});

describe("LiveMatchDashboard wiring", () => {
  it("uses the strict classifier and exposes the resulting status", () => {
    const source = readFileSync(
      join(root, "src/components/match/LiveMatchDashboard.tsx"),
      "utf8",
    );
    assert.match(source, /resolveLineupReadiness\(lineups\.home, lineups\.away\)/);
    assert.match(source, /data-lineup-readiness/);
    assert.doesNotMatch(
      source,
      /Boolean\(lineups\.home\?\.startXI\.length \|\| lineups\.away\?\.startXI\.length\)/,
    );
  });
});

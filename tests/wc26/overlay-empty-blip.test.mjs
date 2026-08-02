import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const overlayMod = await import(
  pathToFileURL(join(root, "src/lib/wc26-fixture-overlay.ts")).href
);
const syncMod = await import(
  pathToFileURL(join(root, "src/lib/wc26-results-sync.ts")).href
);

const {
  clearFixtureOverlay,
  clearLiveFixtureOverlay,
  getFixtureOverlaySnapshot,
  mergeFixtureOverlay,
  replaceLiveFixtureOverlay,
} = overlayMod;
const { applyWc26ScoresToOverlay } = syncMod;

function resetOverlay() {
  clearFixtureOverlay();
}

function liveEntry(overrides = {}) {
  return {
    status: "2h",
    homeScore: 1,
    awayScore: 0,
    elapsed: 92,
    apiFixtureId: 12345,
    ...overrides,
  };
}

test("FE-005: temporary empty replace preserves last-known live overlay", () => {
  resetOverlay();
  mergeFixtureOverlay({ "fixture-live-a": liveEntry() });
  replaceLiveFixtureOverlay({});
  assert.equal(getFixtureOverlaySnapshot()["fixture-live-a"]?.homeScore, 1);
  assert.equal(getFixtureOverlaySnapshot()["fixture-live-a"]?.status, "2h");
});

test("FE-005: later valid live data replaces retained overlay", () => {
  resetOverlay();
  mergeFixtureOverlay({
    "fixture-live-a": liveEntry({ homeScore: 1, awayScore: 0 }),
  });
  replaceLiveFixtureOverlay({});
  replaceLiveFixtureOverlay({
    "fixture-live-a": liveEntry({ homeScore: 2, awayScore: 0, elapsed: 94 }),
  });
  const entry = getFixtureOverlaySnapshot()["fixture-live-a"];
  assert.equal(entry?.homeScore, 2);
  assert.equal(entry?.elapsed, 94);
});

test("FE-005: confirmed empty live clear remains possible", () => {
  resetOverlay();
  mergeFixtureOverlay({
    "fixture-live-a": liveEntry(),
    "fixture-done": { status: "ft", homeScore: 3, awayScore: 1 },
  });
  clearLiveFixtureOverlay();
  assert.equal(getFixtureOverlaySnapshot()["fixture-live-a"], undefined);
  assert.equal(getFixtureOverlaySnapshot()["fixture-done"]?.status, "ft");
});

test("FE-005: applyWc26Scores live empty blip does not wipe prior live", () => {
  resetOverlay();
  mergeFixtureOverlay({ "fixture-live-a": liveEntry() });
  applyWc26ScoresToOverlay({
    matches: [],
    fetchedAt: new Date().toISOString(),
    configured: true,
    phase: "live",
  });
  assert.equal(getFixtureOverlaySnapshot()["fixture-live-a"]?.status, "2h");
});

test("FE-005: error without matches does not wipe prior live", () => {
  resetOverlay();
  mergeFixtureOverlay({ "fixture-live-a": liveEntry() });
  applyWc26ScoresToOverlay({
    matches: [],
    fetchedAt: new Date().toISOString(),
    configured: true,
    phase: "live",
    error: "upstream",
    message: "temporary failure",
  });
  assert.equal(getFixtureOverlaySnapshot()["fixture-live-a"]?.status, "2h");
});

test("FE-005: non-empty live replace still drops fixtures no longer live", () => {
  resetOverlay();
  mergeFixtureOverlay({
    "fixture-live-a": liveEntry(),
    "fixture-live-b": liveEntry({ apiFixtureId: 99 }),
  });
  replaceLiveFixtureOverlay({
    "fixture-live-a": liveEntry({ homeScore: 1, awayScore: 1 }),
  });
  assert.ok(getFixtureOverlaySnapshot()["fixture-live-a"]);
  assert.equal(getFixtureOverlaySnapshot()["fixture-live-b"], undefined);
});
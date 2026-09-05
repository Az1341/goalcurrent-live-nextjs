import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findKnockoutPairing,
  findKnockoutResult,
  loadConfirmedResults,
} from "./load-confirmed-results.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const confirmed = loadConfirmedResults(root);

test("confirmed knockout results include Morocco penalty win for match 75", () => {
  const knockoutModule = readFileSync(join(root, "src/lib/wc26/knockout-confirmed-results.ts"), "utf8");
  const match75 = findKnockoutResult(confirmed, 75);
  const match79 = findKnockoutResult(confirmed, 79);

  assert.ok(match75);
  assert.equal(match75.winnerTeamId, "mar");
  assert.equal(match75.penaltiesHome, 2);
  assert.equal(match75.penaltiesAway, 3);

  assert.ok(match79);
  assert.equal(match79.winnerTeamId, "mex");
  assert.equal(match79.homeScore, 2);
  assert.equal(match79.awayScore, 0);

  assert.match(knockoutModule, /applyConfirmedKnockoutResults/);
});

test("fixture overlay merges confirmed results after API overlay", () => {
  const raw = readFileSync(join(root, "src/lib/wc26-fixture-overlay.ts"), "utf8");
  assert.match(raw, /applyAllConfirmedResults\(merged\)/);
});

test("group confirmed results load all 72 group-stage scores from SSOT", () => {
  const raw = readFileSync(join(root, "src/lib/wc26/group-confirmed-results.ts"), "utf8");
  assert.match(raw, /WC26_CONFIRMED_GROUP_RESULTS/);
  assert.match(raw, /isWc26GroupStageComplete/);
  assert.equal(confirmed.groupResults.length, 72);
  assert.ok(confirmed.groupResults.some((entry) => entry.matchNumber === 72));
});

test("confirmed results unify group and knockout overlays", () => {
  const raw = readFileSync(join(root, "src/lib/wc26/confirmed-results.ts"), "utf8");
  assert.match(raw, /applyConfirmedGroupResults/);
  assert.match(raw, /applyConfirmedKnockoutResults/);
  assert.match(raw, /buildConfirmedStaticApiMatches/);
});

test("standings resolves penalty shootout winners on tied scores", () => {
  const raw = readFileSync(join(root, "src/lib/wc26-standings.ts"), "utf8");
  assert.match(raw, /resolvePenaltyShootoutWinner/);
  assert.match(raw, /getConfirmedKnockoutWinner/);
});

test("bracket mapSide prefers standings team ids over fixture participant", () => {
  const raw = readFileSync(join(root, "src/lib/wc26/bracket-view.ts"), "utf8");
  assert.match(raw, /standingsTeamId/);
  assert.match(raw, /penaltiesForMatch/);
  assert.match(raw, /venueLabel/);
});

test("bracket cards show venue match number penalties and compact header", () => {
  const raw = readFileSync(join(root, "src/components/wc26/bracket/BracketMatchNode.tsx"), "utf8");
  assert.match(raw, /venueLabel/);
  assert.match(raw, /penaltiesLine/);
  assert.match(raw, /M\{match\.matchNumber\}/);
});

test("bracket viewport always uses horizontal scroll rail", () => {
  const fitRaw = readFileSync(join(root, "src/components/wc26/bracket/BracketFitViewport.tsx"), "utf8");
  const cssRaw = readFileSync(join(root, "src/components/wc26/bracket/BracketView.module.css"), "utf8");
  const pageRaw = readFileSync(join(root, "src/components/wc26/bracket/bracket.module.css"), "utf8");
  assert.match(fitRaw, /scrollRail/);
  assert.match(fitRaw, /scrollAffordance/);
  assert.doesNotMatch(fitRaw, /FIT_SCALE_MIN/);
  assert.doesNotMatch(fitRaw, /layout === "fit"/);
  assert.match(cssRaw, /overflow-x:\s*scroll/);
  assert.match(cssRaw, /overscroll-behavior-x:\s*contain/);
  assert.match(pageRaw, /overflow-x:\s*hidden/);
});

test("bracket layout uses wider columns and row height", () => {
  const raw = readFileSync(join(root, "src/components/wc26/bracket/BracketView.tsx"), "utf8");
  assert.match(raw, /COLUMN_WIDTH = 168/);
  assert.match(raw, /ROW_HEIGHT = 108/);
});

test("resolveBracketMatch uses confirmed pairings for known R32 slots", () => {
  const raw = readFileSync(join(root, "src/lib/wc26-standings.ts"), "utf8");
  assert.match(raw, /getConfirmedKnockoutPairingByMatchNumber/);
  assert.match(raw, /sideFromConfirmedTeam/);
});

test("WC26 confirmed results preserve penalty shootout data without provider overlay", () => {
  const raw = readFileSync(join(root, "src/lib/wc26/confirmed-results.ts"), "utf8");
  assert.match(raw, /penaltiesHome/);
  assert.match(raw, /penaltiesAway/);
  assert.match(raw, /buildConfirmedStaticApiMatches/);
});

test("confirmed knockout results include R32 matches 83 through 90", () => {
  const knockoutModule = readFileSync(join(root, "src/lib/wc26/knockout-confirmed-results.ts"), "utf8");
  const liveModule = readFileSync(join(root, "src/lib/wc26-live.ts"), "utf8");
  assert.equal(findKnockoutResult(confirmed, 83)?.winnerTeamId, "por");
  assert.equal(findKnockoutResult(confirmed, 88)?.winnerTeamId, "egy");
  assert.equal(findKnockoutResult(confirmed, 89)?.winnerTeamId, "fra");
  assert.equal(findKnockoutResult(confirmed, 90)?.winnerTeamId, "mar");
  assert.match(knockoutModule, /applyConfirmedKnockoutResults/);
  assert.match(liveModule, /knockoutFixtureHasApiTruth/);
});

test("knockout team pair map includes round-of-16 slots", () => {
  const raw = readFileSync(join(root, "src/lib/wc26-fixture-match.ts"), "utf8");
  assert.match(raw, /"can\|mar":\s*"fixture-090"/);
  assert.match(raw, /"bra\|nor":\s*"fixture-091"/);
});

test("knockout confirmed pairings include round-of-16 slots", () => {
  const pairing089 = findKnockoutPairing(confirmed, "fixture-089");
  const pairing090 = findKnockoutPairing(confirmed, "fixture-090");
  const pairing091 = findKnockoutPairing(confirmed, "fixture-091");
  assert.equal(pairing089?.homeTeamId, "par");
  assert.equal(pairing089?.awayTeamId, "fra");
  assert.equal(pairing090?.homeTeamId, "can");
  assert.equal(pairing090?.awayTeamId, "mar");
  assert.equal(pairing091?.homeTeamId, "bra");
  assert.equal(pairing091?.awayTeamId, "nor");
});
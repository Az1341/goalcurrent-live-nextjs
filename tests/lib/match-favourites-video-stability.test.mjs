import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("homepage match cards expose a real favourite star control", () => {
  const cards = read("src/components/home/v5/HomeLiveMatchCards.tsx");
  assert.match(cards, /FavouriteMatchButton/);
  assert.match(cards, /matchId=\{match\.fixtureId\}/);
  assert.match(cards, /matchId=\{`pl:\$\{fixture\.fixtureId\}`\}/);
  assert.match(cards, /HomeMatchFavourite\.module\.css/);
});

test("homepage SEPANAI promotion cannot mount or autoplay embedded video on page load", () => {
  const video = read("src/components/home/v5/HomeSepanaiVideoAd.tsx");
  assert.doesNotMatch(video, /<video\b/i);
  assert.doesNotMatch(video, /autoPlay|autoplay|videoRequested|SEPANAI_POSTER/);
  assert.match(video, />\s*Watch video\s*</);
  assert.match(video, /homepage never loads or plays the video automatically/i);
});

test("GoalCurrent uses one founder-supplied SEPANAI artwork for all SEPANAI asset paths", () => {
  const mark = read("public/sepanai-mark.svg");
  const headerLogo = read("public/sepanai-logo-official.svg");
  assert.equal(mark, headerLogo);
  assert.match(mark, /viewBox="0 0 291\.000000 332\.000000"/);
  assert.match(mark, /fill="#5EE8BB"/);
  assert.match(mark, /Created by potrace 1\.16/);
});

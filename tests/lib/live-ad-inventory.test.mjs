import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("live-score ad unit rotates SEPANAI, SocialMedia and FAMVI with clear disclosure", () => {
  const ad = read("src/components/ads/LiveScoreAdUnit.tsx");
  assert.match(ad, /Advertisement/);
  assert.match(ad, /SEPANAI\.COM/);
  assert.match(ad, /SocialMedia by SEPANAI\.COM/);
  assert.match(ad, /Your Family’s Chief of Staff/);
  assert.match(ad, /famvi-wordmark-inline\.svg/);
  assert.match(ad, /sepanai-mark\.svg/);
  assert.match(ad, /rel="noopener noreferrer sponsored"/);
  assert.match(ad, /utm_source=goalcurrent/);
  assert.match(ad, /utm_medium=live_score_ad/);
  assert.doesNotMatch(ad, /[?&](email|user_id|uid|phone|device_id)=/i);
});

test("every World Cup live match row is followed by an ad unit", () => {
  const centre = read("src/components/live/LiveMatchCentre.tsx");
  assert.match(centre, /tone === "live" \? <LiveScoreAdUnit index=\{adIndex\} \/>/);
});

test("every Premier League live row is followed by an ad unit", () => {
  const panel = read("src/components/live/PlLivePanel.tsx");
  assert.match(panel, /live\.map\(\(row, index\)/);
  assert.match(panel, /<LiveScoreAdUnit index=\{index\} \/>/);
});

test("every Nations League live row is followed by an ad unit", () => {
  const panel = read("src/components/live/UnlLivePanel.tsx");
  assert.match(panel, /live \? <LiveScoreAdUnit index=\{index \+ 1\} \/>/);
});

test("live ads have a palette independent of GoalCurrent red", () => {
  const css = read("src/components/ads/LiveScoreAdUnit.module.css");
  assert.match(css, /#66e9bd/i);
  assert.match(css, /#fdad09/i);
  assert.match(css, /#4b145f/i);
  assert.doesNotMatch(css, /#c8102e/i);
});

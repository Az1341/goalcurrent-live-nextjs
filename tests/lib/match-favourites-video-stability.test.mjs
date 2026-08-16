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

test("featured Community Shield countdown card exposes a favourite star", () => {
  const countdown = read("src/components/home/v5/HomePlKickoffCountdown.tsx");
  assert.match(countdown, /FavouriteMatchButton/);
  assert.match(countdown, /`cs:\$\{fixture\.fixtureId\}`/);
  assert.match(countdown, /favouriteLabel/);
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

test("Android/PWA cleanup cannot revive a World Cup-era app shell", () => {
  const sw = read("public/sw.js");
  const bootstrap = read("src/components/pwa/ServiceWorkerBootstrap.tsx");
  const home = read("src/app/[locale]/HomeClient.tsx");
  const nav = read("src/lib/nav.ts");
  const ribbon = read("src/components/layout/LiveRibbon.tsx");

  assert.match(sw, /CLEANUP_VERSION = "16"/);
  assert.match(sw, /cacheNames\.map\(\(name\) => caches\.delete\(name\)\)/);
  assert.match(sw, /self\.registration\.unregister\(\)/);
  assert.doesNotMatch(sw, /addEventListener\("fetch"/);
  assert.match(sw, /client\.navigate/);

  assert.match(bootstrap, /registration\.update\(\)/);
  assert.match(bootstrap, /registration\.unregister\(\)/);
  assert.match(bootstrap, /cacheNames\.map\(\(name\) => caches\.delete\(name\)\)/);
  assert.doesNotMatch(bootstrap, /\.register\("\/sw\.js"/);

  assert.match(home, /wc26Views=\{\[\]\}/);

  const mobileTabs = nav.slice(
    nav.indexOf("export const MOBILE_BOTTOM_TABS"),
    nav.indexOf("export const MORE_SHEET_LEVEL1"),
  );
  assert.doesNotMatch(mobileTabs, /worldcup2026|wc26/i);
  assert.match(mobileTabs, /premier-league/);
  assert.match(mobileTabs, /favourites/);

  assert.match(ribbon, /useLiveFixtures/);
  assert.match(ribbon, /premier-league\/fixtures/);
  assert.doesNotMatch(ribbon, /wc26|worldcup2026|useEffectiveFixtures/i);
});

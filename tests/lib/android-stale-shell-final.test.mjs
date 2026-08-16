import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("Android stale-shell retirement deletes every cache and unregisters the app-shell worker", () => {
  const sw = read("public/sw.js");
  const bootstrap = read("src/components/pwa/ServiceWorkerBootstrap.tsx");

  assert.match(sw, /CLEANUP_VERSION = "16"/);
  assert.match(sw, /cacheNames\.map\(\(name\) => caches\.delete\(name\)\)/);
  assert.match(sw, /self\.registration\.unregister\(\)/);
  assert.doesNotMatch(sw, /addEventListener\("fetch"/);
  assert.match(sw, /client\.navigate\("\/"\)/);

  assert.match(bootstrap, /registration\.update\(\)/);
  assert.match(bootstrap, /cacheNames\.map\(\(name\) => caches\.delete\(name\)\)/);
  assert.match(bootstrap, /registration\.unregister\(\)/);
  assert.match(bootstrap, /window\.location\.replace\("\/"\)/);
});

test("current Android-visible chrome is not the old six-tab WC26 shell", () => {
  const bottomBar = read("src/components/layout/BottomTabBar.tsx");
  const liveRibbon = read("src/components/layout/LiveRibbon.tsx");
  const manifest = JSON.parse(read("public/manifest.json").replace(/^\uFEFF/, ""));

  assert.match(bottomBar, /t\("scores"\)/);
  assert.match(bottomBar, /t\("competitions"\)/);
  assert.doesNotMatch(bottomBar, />WC26</i);
  assert.doesNotMatch(bottomBar, /PL 26\/27/);

  assert.doesNotMatch(liveRibbon, /wc26-live|use-effective-fixtures|England\s+1.?2\s+Argentina/i);
  assert.match(liveRibbon, /useLiveFixtures/);
  assert.equal(manifest.start_url, "/");
});

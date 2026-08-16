import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const source = readFileSync(
  join(root, "src/components/pwa/ServiceWorkerBootstrap.tsx"),
  "utf8",
);

test("retired app shell never forces a page reload or re-registers stale caching", () => {
  assert.doesNotMatch(source, /window\.location\.reload\s*\(/);
  assert.doesNotMatch(source, /attachServiceWorkerControllerReload/);
  assert.doesNotMatch(source, /navigator\.serviceWorker\s*\.register\(/);
  assert.match(source, /navigator\.serviceWorker\.getRegistrations\(\)/);
  assert.match(source, /registration\.update\(\)/);
  assert.match(source, /registration\.unregister\(\)/);
  assert.match(source, /cacheNames\.map\(\(name\) => caches\.delete\(name\)\)/);
  assert.match(source, /window\.location\.replace\("\/"\)/);
});

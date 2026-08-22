import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const bootstrapSource = readFileSync(
  join(root, "src/components/pwa/ServiceWorkerBootstrap.tsx"),
  "utf8",
);
const workerSource = readFileSync(join(root, "public/sw.js"), "utf8");

test("legacy app-shell migration updates the installed worker before retirement", () => {
  assert.doesNotMatch(bootstrapSource, /window\.location\.reload\s*\(/);
  assert.doesNotMatch(bootstrapSource, /attachServiceWorkerControllerReload/);
  assert.match(bootstrapSource, /navigator\.serviceWorker\.getRegistrations\(\)/);
  assert.match(bootstrapSource, /registration\.update\(\)/);
  assert.doesNotMatch(bootstrapSource, /registration\.unregister\(\)/);
  assert.match(bootstrapSource, /navigator\.serviceWorker\.register\("\/sw\.js"/);
  assert.match(bootstrapSource, /updateViaCache:\s*"none"/);
});

test("cleanup worker purges WC26-era caches, retires itself, and cannot serve an app shell", () => {
  assert.match(workerSource, /CLEANUP_VERSION\s*=\s*"16"/);
  assert.match(workerSource, /goalcurrent-online-/);
  assert.match(workerSource, /caches\.delete\(name\)/);
  assert.match(workerSource, /self\.clients\.claim\(\)/);
  assert.match(workerSource, /self\.registration\.unregister\(\)/);
  assert.match(workerSource, /gc_app_refresh/);
  assert.match(workerSource, /client\.navigate\(refreshUrl\.href\)/);
  assert.doesNotMatch(workerSource, /addEventListener\(["']fetch["']/);
});

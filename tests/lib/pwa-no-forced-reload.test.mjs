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

test("service worker bootstrap never forces a page reload", () => {
  assert.doesNotMatch(source, /window\.location\.reload\s*\(/);
  assert.doesNotMatch(source, /attachServiceWorkerControllerReload/);
  assert.match(source, /navigator\.serviceWorker\s*\.register\(/);
});

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8");

const transferPages = [
  ["src/app/[locale]/transfers/page.tsx", "latest"],
  ["src/app/[locale]/transfers/rumours/page.tsx", "rumours"],
  ["src/app/[locale]/transfers/completed/page.tsx", "completed"],
  ["src/app/[locale]/transfers/free-agents/page.tsx", "free-agents"],
];

test("public transfer routes use real cached data instead of coming-soon shells", () => {
  for (const [path, view] of transferPages) {
    const source = read(path);
    assert.match(source, /TransferNewsHub/);
    assert.match(source, new RegExp(`view=["']${view}["']`));
    assert.doesNotMatch(source, /ComingSoonPage|coming soon/i);
  }
});

test("transfer hub reads the existing cached news feed and labels rumours honestly", () => {
  const hub = read("src/components/transfers/TransferNewsHub.tsx");
  assert.match(hub, /fetchNewsFeed\(["']all["']\)/);
  assert.match(hub, /article\.tag === ["']TRANSFER["']/);
  assert.match(hub, /Rumours are not presented as confirmed deals/);
  assert.match(hub, /No dedicated/);
});

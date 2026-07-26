import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const {
  onLivePollingVisibilityChange,
  visibilityAwareRefreshInterval,
} = await import(pathToFileURL(join(root, "src/lib/client/fetcher.ts")).href);

test("visibilityAwareRefreshInterval returns interval when document is unavailable", () => {
  assert.equal(visibilityAwareRefreshInterval(15_000), 15_000);
  assert.equal(visibilityAwareRefreshInterval(0), 0);
});

test("visibility change when hidden does not clear or revalidate SWR cache", () => {
  let calls = 0;
  onLivePollingVisibilityChange(true, () => {
    calls += 1;
  });
  assert.equal(calls, 0);
});

test("visibility change when visible revalidates without wiping cache data", () => {
  const filters = [];
  onLivePollingVisibilityChange(false, (filter) => {
    filters.push(filter);
  });
  assert.equal(filters.length, 1);
  assert.equal(filters[0]("/api/wc26/scores?live=true"), true);
  assert.equal(filters[0]("/api/pl/fixtures"), true);
});
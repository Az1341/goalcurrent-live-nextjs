import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("FE-015: finished match poll interval is 0", async () => {
  const { matchDetailRefreshIntervalMs } = await import(
    pathToFileURL(join(root, "src/lib/use-match-detail.ts")).href,
  );
  const { LIVE_POLL_MATCH_MS } = await import(
    pathToFileURL(join(root, "src/lib/client/fetcher.ts")).href,
  );
  assert.equal(matchDetailRefreshIntervalMs(true, "FT"), 0);
  assert.equal(matchDetailRefreshIntervalMs(true, "ft"), 0);
  assert.equal(matchDetailRefreshIntervalMs(true, "AET"), 0);
  assert.equal(matchDetailRefreshIntervalMs(true, "PEN"), 0);
  assert.equal(matchDetailRefreshIntervalMs(true, "finished"), 0);
  assert.equal(matchDetailRefreshIntervalMs(false, "1H"), 0);
  assert.equal(matchDetailRefreshIntervalMs(true, "1H"), LIVE_POLL_MATCH_MS);
  assert.equal(matchDetailRefreshIntervalMs(true, "LIVE"), LIVE_POLL_MATCH_MS);
  assert.equal(matchDetailRefreshIntervalMs(true, undefined), LIVE_POLL_MATCH_MS);
});

test("FE-015: useMatchDetail wires finished status to refreshInterval helper", async () => {
  const fs = await import("node:fs");
  const raw = fs.readFileSync(join(root, "src/lib/use-match-detail.ts"), "utf8");
  assert.match(raw, /matchDetailRefreshIntervalMs/);
  assert.match(raw, /isCompletedMatchStatus/);
  assert.match(raw, /liveMatch\?\.status/);
  assert.doesNotMatch(
    raw,
    /refreshInterval:\s*poll\s*&&\s*fetchReady\s*\?\s*POLL_MS/,
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("FE-015: archived WC26 match detail never polls", async () => {
  const { matchDetailRefreshIntervalMs } = await import(
    pathToFileURL(join(root, "src/lib/use-match-detail.ts")).href,
  );
  assert.equal(matchDetailRefreshIntervalMs(true, "FT"), 0);
  assert.equal(matchDetailRefreshIntervalMs(true, "ft"), 0);
  assert.equal(matchDetailRefreshIntervalMs(true, "AET"), 0);
  assert.equal(matchDetailRefreshIntervalMs(true, "PEN"), 0);
  assert.equal(matchDetailRefreshIntervalMs(true, "finished"), 0);
  assert.equal(matchDetailRefreshIntervalMs(false, "1H"), 0);
  assert.equal(matchDetailRefreshIntervalMs(true, "1H"), 0);
  assert.equal(matchDetailRefreshIntervalMs(true, "LIVE"), 0);
  assert.equal(matchDetailRefreshIntervalMs(true, undefined), 0);
});

test("FE-015: archived WC26 match detail has no provider fetch path", async () => {
  const fs = await import("node:fs");
  const raw = fs.readFileSync(join(root, "src/lib/use-match-detail.ts"), "utf8");
  assert.match(raw, /matchDetailRefreshIntervalMs/);
  assert.match(raw, /WC26 is an archive now/);
  assert.doesNotMatch(raw, /useLiveApi|fetch\(|refreshInterval|LIVE_POLL_MATCH_MS/);
});

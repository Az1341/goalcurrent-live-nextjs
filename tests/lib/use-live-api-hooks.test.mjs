import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const liveDataPath = join(root, "src/lib/client/live-data.ts");
const {
  buildUseLiveApiSwrOptions,
  LIVE_POLL_HUB_MS,
  LIVE_POLL_MATCH_MS,
} = await import(pathToFileURL(liveDataPath).href);

test("useLiveApi source calls useSWR exactly once (hook-stable)", () => {
  const source = readFileSync(liveDataPath, "utf8");
  // Count invocation forms only (useSWR<...> / useSWR(...)), not import or comments.
  const callSites = source.match(/\buseSWR(?:<|\()/g) ?? [];
  assert.equal(
    callSites.length,
    1,
    `expected exactly one useSWR invocation, found ${callSites.length}`,
  );
  assert.equal(source.includes("if (options?.fresh)"), false);
  assert.ok(source.includes("buildUseLiveApiSwrOptions"));
});

test("buildUseLiveApiSwrOptions fresh mode uses match poll defaults", () => {
  const opts = buildUseLiveApiSwrOptions({ fresh: true });
  assert.equal(opts.revalidateOnMount, true);
  assert.equal(opts.keepPreviousData, true);
  assert.equal(opts.dedupingInterval, LIVE_POLL_MATCH_MS);
  assert.equal(opts.revalidateOnFocus, false);
});

test("buildUseLiveApiSwrOptions hub mode uses hub poll defaults", () => {
  const opts = buildUseLiveApiSwrOptions();
  assert.equal(opts.dedupingInterval, LIVE_POLL_HUB_MS);
  assert.equal(opts.revalidateOnFocus, false);
  assert.equal("revalidateOnMount" in opts, false);
});

test("buildUseLiveApiSwrOptions respects explicit refreshInterval in both modes", () => {
  assert.equal(
    buildUseLiveApiSwrOptions({ fresh: true, refreshInterval: 30_000 })
      .dedupingInterval,
    30_000,
  );
  assert.equal(
    buildUseLiveApiSwrOptions({ refreshInterval: 60_000 }).dedupingInterval,
    60_000,
  );
});
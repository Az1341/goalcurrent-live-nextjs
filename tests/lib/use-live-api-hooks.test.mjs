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

test("A: fallbackData passes through unchanged in hub mode", () => {
  const fallbackData = {
    configured: true,
    fixtures: [{ id: "pl-1" }],
    source: "fallback",
  };
  const opts = buildUseLiveApiSwrOptions({ fallbackData });
  assert.equal(opts.fallbackData, fallbackData);
  assert.equal(opts.dedupingInterval, LIVE_POLL_HUB_MS);
});

test("B: empty fixture response is accepted as fallbackData", () => {
  const fallbackData = {
    configured: true,
    fixtures: [],
    source: "fallback",
  };
  const opts = buildUseLiveApiSwrOptions({ fallbackData });
  assert.deepEqual(opts.fallbackData, fallbackData);
  assert.equal(Array.isArray(opts.fallbackData.fixtures), true);
  assert.equal(opts.fallbackData.fixtures.length, 0);
});

test("C: dedupingInterval remains LIVE_POLL_HUB_MS in hub mode with fallbackData", () => {
  const opts = buildUseLiveApiSwrOptions({
    fallbackData: { fixtures: [] },
  });
  assert.equal(opts.dedupingInterval, LIVE_POLL_HUB_MS);
});

test("D: revalidateOnReconnect remains true with fallbackData", () => {
  const opts = buildUseLiveApiSwrOptions({
    fallbackData: { fixtures: [] },
  });
  assert.equal(opts.revalidateOnReconnect, true);
});

test("E: revalidateOnFocus remains false with fallbackData", () => {
  const opts = buildUseLiveApiSwrOptions({
    fallbackData: { fixtures: [] },
  });
  assert.equal(opts.revalidateOnFocus, false);
});

test("F: fresh mode keeps revalidateOnMount, keepPreviousData, match dedupe with fallbackData", () => {
  const fallbackData = { fixtures: [{ id: "live-1" }] };
  const opts = buildUseLiveApiSwrOptions({ fresh: true, fallbackData });
  assert.equal(opts.revalidateOnMount, true);
  assert.equal(opts.keepPreviousData, true);
  assert.equal(opts.dedupingInterval, LIVE_POLL_MATCH_MS);
  assert.equal(opts.fallbackData, fallbackData);
  assert.equal(opts.revalidateOnFocus, false);
  assert.equal(opts.revalidateOnReconnect, true);
});

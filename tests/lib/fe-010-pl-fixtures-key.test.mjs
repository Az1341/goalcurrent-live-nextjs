import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("FE-010: useLiveFixtures owns the canonical /api/pl/fixtures SWR key", () => {
  const hook = readFileSync(
    join(root, "src/lib/client/useLiveFixtures.ts"),
    "utf8",
  );
  assert.match(hook, /LIVE_API_PATHS\.plFixtures/);
  assert.match(hook, /useLiveApi/);
});

test("FE-010: HomeClient and PlHubClient share useLiveFixtures (one fetcher)", () => {
  const home = readFileSync(
    join(root, "src/app/[locale]/HomeClient.tsx"),
    "utf8",
  );
  const hub = readFileSync(
    join(root, "src/components/pl/PlHubClient.tsx"),
    "utf8",
  );

  assert.match(home, /useLiveFixtures/);
  assert.doesNotMatch(
    home,
    /useSWR<PlFixturesApiResponse>|["']\/api\/pl\/fixtures["']/,
    "HomeClient must not register a parallel SWR owner for PL fixtures",
  );

  assert.match(hub, /useLiveFixtures/);
  assert.doesNotMatch(
    hub,
    /useSWR<PlFixturesApiResponse>\(\s*["']\/api\/pl\/fixtures["']/,
    "PlHubClient must not register a parallel SWR owner for PL fixtures",
  );
  assert.doesNotMatch(hub, /["']\/api\/pl\/fixtures["']/);
});

test("FE-010: PlHub broadcaster transform is post-fetch, not a divergent SWR fetcher", () => {
  const hub = readFileSync(
    join(root, "src/components/pl/PlHubClient.tsx"),
    "utf8",
  );
  assert.match(hub, /withVisitorBroadcasters/);
  assert.match(hub, /useMemo/);
  // Divergent fetcher pattern from R2: useSWR(key, (url) => fetch(...).then(transform))
  assert.doesNotMatch(
    hub,
    /useSWR[\s\S]{0,80}\/api\/pl\/fixtures[\s\S]{0,120}withVisitorBroadcasters/,
  );
  assert.doesNotMatch(
    hub,
    /useSWR<PlFixturesApiResponse>\(\s*["']\/api\/pl\/fixtures["']\s*,\s*\(url\)/,
  );
});

test("FE-010: PL fixtures/live clients already use the shared owner", () => {
  const fixtures = readFileSync(
    join(root, "src/components/pl/PlFixturesClient.tsx"),
    "utf8",
  );
  const live = readFileSync(
    join(root, "src/components/pl/PlLiveClient.tsx"),
    "utf8",
  );
  assert.match(fixtures, /useLiveFixtures/);
  assert.match(live, /useLiveFixtures/);
});

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("homepage PL fixtures are fetched once in HomeClient and passed to children", () => {
  const home = readFileSync(join(root, "src/app/[locale]/HomeClient.tsx"), "utf8");
  const today = readFileSync(
    join(root, "src/components/home/v5/HomeTodaysMatches.tsx"),
    "utf8",
  );
  const leagues = readFileSync(
    join(root, "src/components/home/v5/HomeTeamsLeagues.tsx"),
    "utf8",
  );

  assert.match(home, /useLiveFixtures/);
  assert.doesNotMatch(home, /useSWR<PlFixturesApiResponse>|["']\/api\/pl\/fixtures["']/);
  assert.match(home, /plFixtures=\{plFixtures\}/);
  assert.doesNotMatch(today, /useSWR/);
  assert.doesNotMatch(leagues, /useSWR/);
  assert.match(today, /plFixtures/);
  assert.match(leagues, /plFixtures/);
});

test("homepage server-seeds PL response through HomeClient initialPlData", () => {
  const page = readFileSync(join(root, "src/app/[locale]/page.tsx"), "utf8");
  const home = readFileSync(join(root, "src/app/[locale]/HomeClient.tsx"), "utf8");
  const hook = readFileSync(
    join(root, "src/lib/client/useLiveFixtures.ts"),
    "utf8",
  );

  assert.match(page, /import\s*\{\s*ssotFixturesResponse\s*\}\s*from\s*["']@\/lib\/pl\/api["']/);
  assert.match(page, /const\s+initialPlData\s*=\s*ssotFixturesResponse\s*\(\s*\)/);
  assert.match(page, /<HomeClient\s+initialPlData=\{initialPlData\}\s*\/>/);

  assert.match(home, /PlFixturesApiResponse/);
  assert.match(home, /initialPlData:\s*PlFixturesApiResponse/);
  assert.match(home, /useLiveFixtures\(\s*initialPlData\s*\)/);
  assert.match(home, /useEffectiveFixtures\s*\(\s*\)/);
  assert.match(home, /plFixtures\s*=\s*plData\?\.fixtures\s*\?\?\s*\[\]/);
  assert.match(home, /loading=\{plLoading\s*&&\s*!plData\}/);

  assert.match(
    hook,
    /useLiveApi<PlFixturesApiResponse>\(\s*LIVE_API_PATHS\.plFixtures\s*,\s*\{\s*fallbackData:\s*initialData\s*,?\s*\}\s*\)/s,
  );
});

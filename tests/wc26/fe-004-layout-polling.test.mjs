import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("WC26 live layout has no provider sync component", () => {
  const raw = readFileSync(
    join(root, "src/app/[locale]/live/LivePageClient.tsx"),
    "utf8",
  );

  assert.doesNotMatch(raw, /Wc26ResultsSync/);
  assert.doesNotMatch(raw, /useLiveScores/);
  assert.doesNotMatch(raw, /ApiFootballStatusBanner/);
});

test("WC26 match layout has no provider sync component", () => {
  const raw = readFileSync(
    join(root, "src/app/[locale]/match/[fixtureId]/MatchPageClient.tsx"),
    "utf8",
  );

  assert.doesNotMatch(raw, /Wc26ResultsSync/);
  assert.doesNotMatch(raw, /useLiveScores/);
  assert.doesNotMatch(raw, /ApiFootballStatusBanner/);
});

test("retired WC26 results sync file is removed", () => {
  assert.equal(existsSync(join(root, "src/components/wc26/Wc26ResultsSync.tsx")), false);
});

import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("WC26 archive pages do not mount the retired results sync", () => {
  const syncPath = join(root, "src/components/wc26/Wc26ResultsSync.tsx");
  assert.equal(existsSync(syncPath), false);

  for (const pagePath of [
    "src/app/[locale]/live/LivePageClient.tsx",
    "src/app/[locale]/match/[fixtureId]/MatchPageClient.tsx",
  ]) {
    const raw = readFileSync(join(root, pagePath), "utf8");
    assert.doesNotMatch(raw, /Wc26ResultsSync/);
  }
});

test("FinalWinnerCelebration uses confirmed static archive data only", () => {
  const raw = readFileSync(
    join(root, "src/components/wc26/FinalWinnerCelebration.tsx"),
    "utf8",
  );

  assert.match(raw, /buildConfirmedStaticApiMatches/);
  assert.doesNotMatch(raw, /LIVE_API_PATHS/);
  assert.doesNotMatch(raw, /useLiveApi/);
});

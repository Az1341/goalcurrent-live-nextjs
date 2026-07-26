import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("Wc26ResultsSync disables network paths when tournament archive is complete", () => {
  const raw = readFileSync(join(root, "src/components/wc26/Wc26ResultsSync.tsx"), "utf8");
  assert.match(raw, /isWc26TournamentComplete/);
  assert.match(raw, /archiveComplete \? null : LIVE_API_PATHS\.wc26LiveScores/);
  assert.match(raw, /archiveComplete \? null : LIVE_API_PATHS\.wc26Results/);
});

test("FinalWinnerCelebration disables archive polling paths", () => {
  const raw = readFileSync(
    join(root, "src/components/wc26/FinalWinnerCelebration.tsx"),
    "utf8",
  );
  assert.match(raw, /isWc26TournamentComplete/);
  assert.match(raw, /archiveComplete \? null : LIVE_API_PATHS\.wc26LiveScores/);
});
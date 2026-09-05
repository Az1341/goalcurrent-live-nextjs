import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("WC26 scores route is archive-only and does not call provider fetch helpers", () => {
  const raw = readFileSync(join(root, "src/app/api/wc26/scores/route.ts"), "utf8");

  assert.match(raw, /buildConfirmedStaticApiMatches/);
  assert.doesNotMatch(raw, /apiFootballFetch/);
  assert.doesNotMatch(raw, /fetchFinishedWc26Matches/);
  assert.doesNotMatch(raw, /fetchLiveWc26Matches/);
});

test("shared provider fetch keeps auth header redacted outside WC26 archive", () => {
  const raw = readFileSync(join(root, "src/lib/server/api-football.ts"), "utf8");

  assert.match(raw, /Authorization/);
  assert.doesNotMatch(raw, /console\.(?:log|warn|error)\([^)]*process\.env\["API_" \+ "FOOTBALL_KEY"\]/);
});

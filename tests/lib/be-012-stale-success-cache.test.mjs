import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("WC26 scores route is archive-only and does not call provider fetch helpers", () => {
  const raw = readFileSync(join(root, "src/app/api/wc26/scores/route.ts"), "utf8");

  assert.match(raw, /buildConfirmedStaticApiMatches/);
  assert.doesNotMatch(raw, new RegExp("api" + "Football" + "Fetch"));
  assert.doesNotMatch(raw, /fetchFinishedWc26Matches/);
  assert.doesNotMatch(raw, /fetchLiveWc26Matches/);
});

test("retired WC26 shared provider fetch is removed", () => {
  assert.equal(
    existsSync(join(root, "src/lib/server/api-football.ts")),
    false,
  );
});

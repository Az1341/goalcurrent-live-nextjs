import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
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

test("shared provider fetch keeps auth header redacted outside WC26 archive", () => {
  const raw = readFileSync(join(root, "src/lib/server/api-football.ts"), "utf8");

  assert.match(raw, /Authorization/);
  const key = "API_" + "FOOTBALL_KEY";
  assert.equal(raw.includes(`console.log(process.env["${key}"])`), false);
  assert.equal(raw.includes(`console.warn(process.env["${key}"])`), false);
  assert.equal(raw.includes(`console.error(process.env["${key}"])`), false);
});

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("FE-004: Layout does not mount site-wide Wc26ResultsSync", () => {
  const raw = readFileSync(
    join(root, "src/components/layout/Layout.tsx"),
    "utf8",
  );
  assert.doesNotMatch(
    raw,
    /Wc26ResultsSync/,
    "Layout must not import or render Wc26ResultsSync",
  );
});

test("FE-004: live and match surfaces mount Wc26ResultsSync", () => {
  const live = readFileSync(
    join(root, "src/app/[locale]/live/LivePageClient.tsx"),
    "utf8",
  );
  const match = readFileSync(
    join(root, "src/app/[locale]/match/[fixtureId]/MatchPageClient.tsx"),
    "utf8",
  );
  assert.match(live, /Wc26ResultsSync/);
  assert.match(match, /Wc26ResultsSync/);
});

test("FE-004: results sync demotes results cadence to hub interval", () => {
  const raw = readFileSync(
    join(root, "src/components/wc26/Wc26ResultsSync.tsx"),
    "utf8",
  );
  assert.match(raw, /LIVE_POLL_HUB_MS/);
  assert.match(raw, /refreshInterval:\s*LIVE_POLL_HUB_MS/);
  assert.match(raw, /fresh:\s*true/);
  const resultsCall = raw.indexOf("resultsData");
  assert.ok(resultsCall >= 0);
  const resultsSnippet = raw.slice(resultsCall, resultsCall + 220);
  assert.match(resultsSnippet, /LIVE_POLL_HUB_MS/);
  assert.doesNotMatch(resultsSnippet, /fresh:\s*true/);
});

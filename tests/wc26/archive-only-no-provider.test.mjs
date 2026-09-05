import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const removedPaths = [
  "src/app/api/debug/wc26/route.ts",
  "src/app/api/wc26/" + "fixtures/route.ts",
  "src/app/api/wc26/" + "knockout-fixtures/route.ts",
  "src/app/api/wc26/" + "match/[fixtureId]/route.ts",
  "src/app/api/wc26/" + "top-scorers/route.ts",
  "src/lib/server/wc26-" + "api-football.ts",
  "src/lib/server/wc26-" + "match-detail.ts",
  "src/lib/server/wc26-top-scorers.ts",
  "src/lib/server/wc26-" + "top-scorers-sources",
];

const forbiddenMarkers = [
  "api" + "Football" + "Fetch",
  "football." + "api-sports.io",
  "API_" + "FOOTBALL_KEY",
  "LIVE_API_PATHS." + "wc26",
  "/api/wc26/" + "fixtures",
  "/api/wc26/" + "knockout-fixtures",
  "/api/wc26/" + "match",
  "/api/wc26/" + "top-scorers",
];

function collectFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return collectFiles(path);
    return path.endsWith(".ts") || path.endsWith(".tsx") ? [path] : [];
  });
}

test("WC26 live/provider routes and helpers are removed", () => {
  for (const path of removedPaths) {
    assert.equal(existsSync(join(root, path)), false, `${path} must stay removed`);
  }
});

test("WC26 source stays archive-only and provider-free", () => {
  const files = [
    ...collectFiles(join(root, "src/app/api/wc26")),
    ...collectFiles(join(root, "src/components/wc26")),
    ...collectFiles(join(root, "src/lib")).filter((file) =>
      relative(root, file).toLowerCase().includes("wc26"),
    ),
    ...collectFiles(join(root, "src/types")).filter((file) =>
      relative(root, file).toLowerCase().includes("wc26") ||
      relative(root, file).includes("fixture-overlay"),
    ),
  ];

  const failures = [];
  for (const file of files) {
    const rel = relative(root, file);
    const raw = readFileSync(file, "utf8");
    for (const marker of forbiddenMarkers) {
      if (raw.includes(marker)) {
        failures.push(`${rel}: ${marker}`);
      }
    }
  }

  assert.deepEqual(failures, []);
});

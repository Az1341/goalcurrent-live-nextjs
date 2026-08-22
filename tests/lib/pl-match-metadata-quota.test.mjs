import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const source = readFileSync(
  join(root, "src/app/[locale]/premier-league/match/[fixtureId]/page.tsx"),
  "utf8",
);

function between(start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.ok(startIndex >= 0, `missing start marker: ${start}`);
  assert.ok(endIndex > startIndex, `missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

describe("Premier League match metadata quota isolation", () => {
  it("does not call the live match-detail provider from generateMetadata", () => {
    const metadataSource = between(
      "export async function generateMetadata",
      "export default async function PremierLeagueMatchPage",
    );
    assert.doesNotMatch(metadataSource, /getCachedPlMatchDetail\s*\(/);
    assert.doesNotMatch(metadataSource, /fetchPlMatchDetail\s*\(/);
  });

  it("keeps the single cached provider read in the page render", () => {
    const pageSource = source.slice(
      source.indexOf("export default async function PremierLeagueMatchPage"),
    );
    const calls = pageSource.match(/getCachedPlMatchDetail\s*\(/g) ?? [];
    assert.equal(calls.length, 1);
  });

  it("preserves a canonical fixture-specific metadata path", () => {
    const metadataSource = between(
      "export async function generateMetadata",
      "export default async function PremierLeagueMatchPage",
    );
    assert.match(metadataSource, /path:\s*`\/premier-league\/match\/\$\{fixtureId\}`/);
    assert.match(metadataSource, /Premier League Match Centre/);
  });
});

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("Premier League table passes server fallback rows into the client", () => {
  const page = read("src/app/[locale]/premier-league/table/page.tsx");
  const client = read("src/components/pl/PlTableClient.tsx");

  assert.match(page, /buildZeroStandingsFromTeams/);
  assert.match(page, /const initialData: PlStandingsApiResponse/);
  assert.match(page, /<PlTableClient initialData=\{initialData\}/);
  assert.match(client, /initialData\?: PlStandingsApiResponse/);
  assert.match(client, /initialHasRows \? ["']ready["'] : ["']loading["']/);
  assert.match(client, /if \(initialHasRows\) \{\s*setView\(["']ready["']\)/s);
});

import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const navMod = pathToFileURL(join(root, "src/lib/nav.ts")).href;

test("DESKTOP_SIDEBAR_LEAGUES_NAV uses founder-approved order without WC26", async () => {
  const { DESKTOP_SIDEBAR_LEAGUES_NAV, DESKTOP_COMPETITIONS_NAV } =
    await import(navMod);

  const ids = DESKTOP_SIDEBAR_LEAGUES_NAV.map((item) => item.id);
  assert.deepEqual(ids, ["pl", "ucl", "laliga", "seriea", "bundesliga"]);

  const pl = DESKTOP_COMPETITIONS_NAV.find((group) => group.id === "pl");
  const ucl = DESKTOP_COMPETITIONS_NAV.find((group) => group.id === "ucl");
  assert.equal(DESKTOP_SIDEBAR_LEAGUES_NAV[0]?.href, pl?.href);
  assert.equal(DESKTOP_SIDEBAR_LEAGUES_NAV[1]?.href, ucl?.href);

  for (const item of DESKTOP_SIDEBAR_LEAGUES_NAV) {
    assert.ok(!item.href.includes("worldcup"));
    assert.ok(!item.labelKey.toLowerCase().includes("wc26"));
  }
});
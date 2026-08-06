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

test("DESKTOP_PRIMARY_NAV uses locked GC-NAV-20260806-170000 order", async () => {
  const { DESKTOP_PRIMARY_NAV, FAVOURITES_HREF } = await import(navMod);

  assert.deepEqual(
    DESKTOP_PRIMARY_NAV.map((item) => item.href),
    [
      "/",
      "/live",
      "/transfers",
      "/premier-league/table",
      "/news",
      FAVOURITES_HREF,
      "/videos",
      "/articles",
    ],
  );
  assert.deepEqual(
    DESKTOP_PRIMARY_NAV.map((item) => item.labelKey),
    [
      "home",
      "scores",
      "transfers",
      "tables",
      "news",
      "favourites",
      "videos",
      "articles",
    ],
  );
  // League hubs must not be injected into primary header nav.
  for (const item of DESKTOP_PRIMARY_NAV) {
    assert.ok(!item.href.includes("la-liga"));
    assert.ok(!item.href.includes("serie-a"));
    assert.ok(!item.href.includes("bundesliga"));
    assert.ok(!item.href.includes("champions-league"));
    assert.notEqual(item.href, "/premier-league");
  }
});
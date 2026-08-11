import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const navMod = pathToFileURL(join(root, "src/lib/nav.ts")).href;

const DOMESTIC_HUB_ANCHORS = [
  "league-next-fixture",
  "league-latest-result",
  "league-table-snapshot",
];

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

test("DESKTOP_COMPETITIONS_NAV includes domestic leagues with honest hub anchors", async () => {
  const {
    DESKTOP_COMPETITIONS_NAV,
    MORE_SHEET_COMPETITION_IDS,
    MORE_SHEET_SUBMENUS,
    isDesktopCompetitionsActive,
  } = await import(navMod);

  assert.deepEqual(
    DESKTOP_COMPETITIONS_NAV.map((group) => group.id),
    ["pl", "ucl", "laliga", "seriea", "bundesliga", "facup", "comshield", "unl"],
  );
  assert.deepEqual([...MORE_SHEET_COMPETITION_IDS], [
    "pl",
    "ucl",
    "laliga",
    "seriea",
    "bundesliga",
    "facup",
    "unl",
  ]);

  const comshield = DESKTOP_COMPETITIONS_NAV.find(
    (group) => group.id === "comshield",
  );
  assert.ok(comshield);
  assert.equal(comshield.href, "/community-shield");
  assert.deepEqual(
    comshield.links.map((link) => link.href),
    ["/community-shield"],
  );
  assert.equal(isDesktopCompetitionsActive("/community-shield"), true);

  const domestic = [
    { id: "laliga", hub: "/la-liga" },
    { id: "seriea", hub: "/serie-a" },
    { id: "bundesliga", hub: "/bundesliga" },
  ];

  for (const { id, hub } of domestic) {
    const group = DESKTOP_COMPETITIONS_NAV.find((item) => item.id === id);
    assert.ok(group, `missing competitions group ${id}`);
    assert.equal(group.href, hub);
    assert.deepEqual(
      group.links.map((link) => link.href),
      [
        hub,
        `${hub}#league-next-fixture`,
        `${hub}#league-latest-result`,
        `${hub}#league-table-snapshot`,
      ],
    );
    assert.deepEqual(
      MORE_SHEET_SUBMENUS[id].map((link) => link.href),
      group.links.map((link) => link.href),
    );
    for (const href of group.links.map((link) => link.href)) {
      for (const fake of ["#ucl-", "#facup-", "/fixtures", "/table"]) {
        assert.ok(!href.includes(fake), `${id} must not invent ${fake}`);
      }
    }
    for (const anchor of DOMESTIC_HUB_ANCHORS) {
      assert.ok(
        group.links.some((link) => link.href.endsWith(`#${anchor}`)),
        `${id} missing #${anchor}`,
      );
    }
    assert.equal(isDesktopCompetitionsActive(hub), true);
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
test("MOBILE_BOTTOM_TABS unchanged - CS held until 5-tab redesign merges", async () => {
  const { MOBILE_BOTTOM_TABS } = await import(navMod);
  assert.deepEqual(
    MOBILE_BOTTOM_TABS.map((tab) => tab.id),
    ["home", "live", "favourites", "pl", "articles"],
  );
  assert.equal(
    MOBILE_BOTTOM_TABS.some((tab) => tab.href.includes("community-shield")),
    false,
  );
});
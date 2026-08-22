import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const href = (rel) => pathToFileURL(join(root, rel)).href;

const DEFAULT_ORIGIN = "https://goalcurrent.live";
const LOCALE_LOC = /^https:\/\/goalcurrent\.live\/(en|es|it|de|fr|nl)(\/|$)/;

const FAMILY_CASES = [
  { name: "homepage", path: "/", loc: `${DEFAULT_ORIGIN}/` },
  { name: "scores", path: "/live", loc: `${DEFAULT_ORIGIN}/live` },
  { name: "league hub", path: "/premier-league", loc: `${DEFAULT_ORIGIN}/premier-league` },
  { name: "team", path: "/premier-league/clubs/arsenal", loc: `${DEFAULT_ORIGIN}/premier-league/clubs/arsenal` },
  { name: "match", path: "/match/fixture-001", loc: `${DEFAULT_ORIGIN}/match/fixture-001` },
  { name: "article", path: "/articles/premier-league-2026-27-two-weeks-out", loc: `${DEFAULT_ORIGIN}/articles/premier-league-2026-27-two-weeks-out` },
];

const EXCLUDED_CASES = [
  { name: "legacy match hub", path: "/worldcup2026/match/fixture-001" },
  { name: "noindex UCL hub", path: "/champions-league" },
  { name: "API", path: "/api/health" },
];

const { collectSitemapPathSpecs, generateGoalCurrentSitemap } = await import(
  href("src/lib/seo/sitemap-entries.ts")
);
const { getNewsSitemapEntries } = await import(
  href("src/lib/seo/news-sitemap.ts")
);

test("sitemap loc is one default-locale URL per logical page", () => {
  const specs = collectSitemapPathSpecs();
  const sitemap = generateGoalCurrentSitemap();
  const locs = sitemap.map((entry) => entry.url);

  assert.equal(sitemap.length, specs.length);
  assert.equal(locs.length, new Set(locs).size);
  assert.equal(
    locs.filter((url) => LOCALE_LOC.test(url)).length,
    0,
    "locale-prefixed locs must not be advertised as index targets",
  );
  assert.ok(locs.every((url) => url.startsWith(`${DEFAULT_ORIGIN}/`)));
});

test("indexable families keep a self-canonical English loc plus hreflang", () => {
  const sitemap = generateGoalCurrentSitemap();
  const byUrl = new Map(sitemap.map((entry) => [entry.url, entry]));

  for (const row of FAMILY_CASES) {
    const entry = byUrl.get(row.loc);
    assert.ok(entry, `missing ${row.name} loc ${row.loc}`);
    assert.equal(entry.alternates?.languages?.en, row.loc);
    assert.equal(entry.alternates?.languages?.["x-default"], row.loc);
    assert.equal(
      entry.alternates?.languages?.de,
      row.path === "/"
        ? `${DEFAULT_ORIGIN}/de`
        : `${DEFAULT_ORIGIN}/de${row.path}`,
    );
    assert.equal(byUrl.has(`${DEFAULT_ORIGIN}/de${row.path === "/" ? "" : row.path}`), false);
  }
});

test("redirect, noindex, and private paths stay out of the sitemap", () => {
  const paths = new Set(collectSitemapPathSpecs().map((item) => item.path));
  for (const row of EXCLUDED_CASES) {
    assert.equal(paths.has(row.path), false, `${row.name} must stay excluded`);
  }
});

test("news sitemap locs stay on the default locale when entries exist", () => {
  const entries = getNewsSitemapEntries();
  for (const entry of entries) {
    assert.equal(entry.language, "en");
    assert.equal(LOCALE_LOC.test(entry.loc), false, entry.loc);
    assert.ok(entry.loc.startsWith(`${DEFAULT_ORIGIN}/`));
  }

  const source = readFileSync(join(root, "src/lib/seo/news-sitemap.ts"), "utf8");
  assert.match(source, /expandForDefaultLocale/);
  assert.doesNotMatch(source, /expandForAllLocales/);
});

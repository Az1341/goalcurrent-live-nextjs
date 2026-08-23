import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const href = (rel) => pathToFileURL(join(root, rel)).href;

const DEFAULT_ORIGIN = "https://goalcurrent.live";
const LOCALE_LOC = /^https:\/\/goalcurrent\.live\/(en|es|it|de|fr|nl)(\/|$)/;

const SELF_CANONICAL_CASES = [
  { name: "homepage", path: "/", loc: `${DEFAULT_ORIGIN}/`, deLoc: `${DEFAULT_ORIGIN}/de` },
  { name: "scores", path: "/live", loc: `${DEFAULT_ORIGIN}/live`, deLoc: `${DEFAULT_ORIGIN}/de/live` },
  { name: "league hub", path: "/premier-league", loc: `${DEFAULT_ORIGIN}/premier-league`, deLoc: `${DEFAULT_ORIGIN}/de/premier-league` },
  { name: "team", path: "/premier-league/clubs/arsenal", loc: `${DEFAULT_ORIGIN}/premier-league/clubs/arsenal`, deLoc: `${DEFAULT_ORIGIN}/de/premier-league/clubs/arsenal` },
];

const ENGLISH_CANONICAL_CASES = [
  { name: "match", path: "/match/fixture-001", loc: `${DEFAULT_ORIGIN}/match/fixture-001`, deLoc: `${DEFAULT_ORIGIN}/de/match/fixture-001` },
  { name: "article", path: "/articles/premier-league-2026-27-two-weeks-out", loc: `${DEFAULT_ORIGIN}/articles/premier-league-2026-27-two-weeks-out`, deLoc: `${DEFAULT_ORIGIN}/de/articles/premier-league-2026-27-two-weeks-out` },
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

test("self-canonical families keep locale sitemap locs plus hreflang", () => {
  const sitemap = generateGoalCurrentSitemap();
  const byUrl = new Map(sitemap.map((entry) => [entry.url, entry]));

  for (const row of SELF_CANONICAL_CASES) {
    const entry = byUrl.get(row.loc);
    assert.ok(entry, `missing ${row.name} loc ${row.loc}`);
    assert.equal(entry.alternates?.languages?.en, row.loc);
    assert.equal(entry.alternates?.languages?.["x-default"], row.loc);
    assert.equal(entry.alternates?.languages?.de, row.deLoc);
    const deEntry = byUrl.get(row.deLoc);
    assert.ok(deEntry, `missing ${row.name} locale loc ${row.deLoc}`);
    assert.equal(deEntry.alternates?.languages?.en, row.loc);
    assert.equal(deEntry.alternates?.languages?.["x-default"], row.loc);
  }
});

test("English-canonical match and article families emit the default-locale loc only", () => {
  const sitemap = generateGoalCurrentSitemap();
  const byUrl = new Map(sitemap.map((entry) => [entry.url, entry]));

  for (const row of ENGLISH_CANONICAL_CASES) {
    const entry = byUrl.get(row.loc);
    assert.ok(entry, `missing ${row.name} loc ${row.loc}`);
    assert.equal(entry.alternates?.languages?.en, row.loc);
    assert.equal(entry.alternates?.languages?.["x-default"], row.loc);
    assert.equal(entry.alternates?.languages?.de, row.deLoc);
    assert.equal(byUrl.has(row.deLoc), false, `${row.name} must not emit ${row.deLoc}`);
  }

  const localeMatchOrArticle = sitemap
    .map((entry) => entry.url)
    .filter((url) => LOCALE_LOC.test(url))
    .filter((url) => url.includes("/match/") || url.includes("/articles/"));
  assert.deepEqual(localeMatchOrArticle, []);
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

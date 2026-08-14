import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("root SEO metadata is competition-neutral and uses the shared brand theme colour", () => {
  const layout = read("src/app/[locale]/layout.tsx");
  assert.doesNotMatch(layout, /default:\s*`\$\{SITE_NAME\} - FIFA World Cup 2026/);
  assert.doesNotMatch(layout, /themeColor:\s*["']#8B0000["']/i);
  assert.match(layout, /themeColor:\s*BRAND_THEME_COLOR/);
  assert.match(layout, /Live Football Scores, Fixtures and News/);
});

test("site-wide fallback social image is not WC26-branded", () => {
  const constants = read("src/lib/seo/constants.ts");
  assert.doesNotMatch(constants, /screenshot-desktop\.png/);
  assert.doesNotMatch(constants, /FIFA World Cup 2026 on desktop/);
  assert.match(constants, /icon-512\.png/);
});

test("homepage source surfaces exclude WC26 archive content", () => {
  const page = read("src/app/[locale]/page.tsx");
  const client = read("src/app/[locale]/HomeClient.tsx");
  const leagues = read("src/components/home/v5/HomeTeamsLeagues.tsx");
  const today = read("src/components/home/v5/HomeTodaysMatches.tsx");

  assert.doesNotMatch(page, /HomeFeaturedMatchJsonLd|getSeoEffectiveFixtures|wc26Selection/);
  assert.doesNotMatch(client, /HomeChampionSnippet|selectHomepageFixtures|heroWc26Views/);
  assert.match(client, /wc26Views=\{\[\]\}/);
  assert.doesNotMatch(leagues, /worldcup2026|World Cup 2026/i);
  assert.doesNotMatch(today, /Wc26MatchCard|World Cup 2026|wc26Today/);
});

test("global footer no longer renders stale WC26 tagline or X link", () => {
  const footer = read("src/components/layout/MasterFooter.tsx");
  const social = read("src/components/layout/SocialLinks.tsx");
  assert.doesNotMatch(footer, /tLayout\(["']tagline["']\)/);
  assert.match(social, /social\.icon !== ["']twitter["']/);
});

test("team news has crawler-readable editorial fallback instead of loading copy", () => {
  const profileNews = read("src/components/team-profile/ProfileNewsSection.tsx");
  assert.match(profileNews, /getEditorialNewsArticles/);
  assert.doesNotMatch(profileNews, /Loading news\.\.\./);
});

test("locale route loading boundary does not emit literal Loading text", () => {
  const loading = read("src/app/[locale]/loading.tsx");
  assert.doesNotMatch(loading, />\s*Loading(?:…|\.\.\.)\s*</);
});

test("legacy WC26 match path permanently redirects to canonical match route", () => {
  const redirectPage = read("src/app/[locale]/worldcup2026/match/[fixtureId]/page.tsx");
  const helper = read("src/lib/wc26-match.ts");
  const nextConfig = read("next.config.ts");
  assert.match(helper, /return `\/match\/\$\{encodeURIComponent\(fixtureId\)\}`/);
  assert.match(redirectPage, /permanentRedirect\(matchHref\(fixtureId\)\)/);
  assert.match(nextConfig, /source:\s*["']\/worldcup2026\/match\/:fixtureId["']/);
  assert.match(nextConfig, /destination:\s*["']\/match\/:fixtureId["']/);
  assert.match(nextConfig, /permanent:\s*true/);
});

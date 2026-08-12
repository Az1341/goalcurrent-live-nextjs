import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const mod = await import(
  pathToFileURL(join(root, "src/lib/content/pl-season-countdown-article.ts")).href
);
const hub = await import(pathToFileURL(join(root, "src/lib/article-hub.ts")).href);
const editorial = await import(
  pathToFileURL(join(root, "src/lib/editorial-news.ts")).href
);
const seo = await import(pathToFileURL(join(root, "src/lib/seo/article-seo.ts")).href);
const { formatNewsRelativeTime } = await import(
  pathToFileURL(join(root, "src/lib/news-format.ts")).href
);

const AUG12 = Date.parse("2026-08-12T19:00:00.000Z"); // 9 days out
const AUG12_MORNING = Date.parse("2026-08-12T07:30:00.000Z"); // before 09:00Z stamp
const AUG7 = Date.parse("2026-08-07T12:00:00.000Z"); // 14 days out
const AFTER = Date.parse("2026-08-22T12:00:00.000Z");

test("daysUntilPlSeasonKickoff counts down to Arsenal vs Coventry", () => {
  assert.equal(mod.daysUntilPlSeasonKickoff(AUG7), 14);
  assert.equal(mod.daysUntilPlSeasonKickoff(AUG12), 9);
  assert.equal(mod.daysUntilPlSeasonKickoff(AFTER), 0);
});

test("rolling publish iso uses day stamp after 09:00Z and never a future dateTime", () => {
  assert.equal(
    mod.rollingPlSeasonCountdownPublishIso(AUG12),
    "2026-08-12T09:00:00.000Z",
  );
  assert.equal(
    mod.rollingPlSeasonCountdownPublishIso(AUG12_MORNING),
    new Date(AUG12_MORNING).toISOString(),
  );
  const morningMs = Date.parse(mod.rollingPlSeasonCountdownPublishIso(AUG12_MORNING));
  assert.ok(morningMs <= AUG12_MORNING);
  assert.equal(mod.rollingPlSeasonCountdownPublishIso(AFTER), null);
});

test("headline updates daily instead of staying Two Weeks", () => {
  assert.match(mod.plSeasonCountdownHeadline(AUG7), /^Two Weeks to Kick-Off/);
  assert.match(mod.plSeasonCountdownHeadline(AUG12), /^9 Days to Kick-Off/);
  assert.match(mod.plSeasonCountdownHeadline(AFTER), /^Kick-Off Day/);
});

test("homepage featured card uses rolling date so relative time is same-day", () => {
  const [featured] = editorial.mergeHomepageNewsFeed([], AUG12);
  assert.ok(featured?.link.includes("premier-league-2026-27-two-weeks-out"));
  assert.equal(featured.date, "2026-08-12T09:00:00.000Z");
  const ageMs = AUG12 - Date.parse(featured.date);
  assert.ok(ageMs < 48 * 60 * 60 * 1000, `expected <48h freshness, got ${ageMs}ms`);
  const label = formatNewsRelativeTime(featured.date, AUG12);
  assert.equal(label.includes("day"), false, `stale label: ${label}`);
});

test("articleIndex news mapping applies rolling title with frozen now", () => {
  const beforeKickoff = hub.getArticleIndexNewsArticles(AUG12);
  const card = beforeKickoff.find((a) =>
    a.link.includes("premier-league-2026-27-two-weeks-out"),
  );
  assert.ok(card);
  assert.match(card.title, /^9 Days to Kick-Off/);

  const onTwoWeeksDay = hub.getArticleIndexNewsArticles(AUG7);
  const twoWeeks = onTwoWeeksDay.find((a) =>
    a.link.includes("premier-league-2026-27-two-weeks-out"),
  );
  assert.ok(twoWeeks);
  assert.match(twoWeeks.title, /^Two Weeks to Kick-Off/);

  const afterKickoff = hub.getArticleIndexNewsArticles(AFTER);
  const aged = afterKickoff.find((a) =>
    a.link.includes("premier-league-2026-27-two-weeks-out"),
  );
  assert.ok(aged);
  assert.match(aged.title, /^Kick-Off Day/);
  assert.equal(mod.rollingPlSeasonCountdownPublishIso(AFTER), null);
  // Falls back to static ARTICLE_INDEX date (not a rolling same-day stamp).
  assert.ok(Date.parse(aged.date) < AFTER);
  assert.notEqual(aged.date, "2026-08-22T09:00:00.000Z");
});

test("article SEO uses rolling headline while keeping original publish date", () => {
  const schema = seo.articleSeoFromSlug("premier-league-2026-27-two-weeks-out");
  assert.ok(schema);
  assert.equal(schema.headline, mod.plSeasonCountdownHeadline());
  assert.equal(schema.datePublished, mod.PL_SEASON_COUNTDOWN_ORIGINAL_PUBLISH_ISO);
  assert.ok(schema.dateModified);
  assert.notEqual(schema.dateModified, "7 August 2026");
});

test("hero SVG no longer hard-codes 7 August 2026", () => {
  const svg = readFileSync(
    join(root, "public/images/news/premier-league-2026-27-two-weeks-out/hero.svg"),
    "utf8",
  );
  assert.equal(svg.includes("7 August 2026"), false);
  assert.match(svg, /updated daily/);
});
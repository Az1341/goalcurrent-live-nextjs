import assert from "node:assert/strict";
import test from "node:test";
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
const { formatNewsRelativeTime } = await import(
  pathToFileURL(join(root, "src/lib/news-format.ts")).href
);

const AUG12 = Date.parse("2026-08-12T19:00:00.000Z"); // ~9 days to Fri 21 Aug 19:00Z
const AUG7 = Date.parse("2026-08-07T12:00:00.000Z"); // 14 days out
const AFTER = Date.parse("2026-08-22T12:00:00.000Z");

test("daysUntilPlSeasonKickoff counts down to Arsenal vs Coventry", () => {
  assert.equal(mod.daysUntilPlSeasonKickoff(AUG7), 14);
  assert.equal(mod.daysUntilPlSeasonKickoff(AUG12), 9);
  assert.equal(mod.daysUntilPlSeasonKickoff(AFTER), 0);
});

test("rolling publish iso refreshes on London calendar day before kickoff", () => {
  assert.equal(
    mod.rollingPlSeasonCountdownPublishIso(AUG12),
    "2026-08-12T09:00:00.000Z",
  );
  assert.equal(mod.rollingPlSeasonCountdownPublishIso(AFTER), null);
});

test("headline updates daily instead of staying Two Weeks", () => {
  assert.match(mod.plSeasonCountdownHeadline(AUG7), /^Two Weeks to Kick-Off/);
  assert.match(mod.plSeasonCountdownHeadline(AUG12), /^9 Days to Kick-Off/);
  assert.match(mod.plSeasonCountdownHeadline(AFTER), /^Kick-Off Day/);
});

test("homepage featured card uses rolling date so relative time is same-day", () => {
  const [featured] = editorial.mergeHomepageNewsFeed([]);
  assert.ok(featured?.link.includes("premier-league-2026-27-two-weeks-out"));
  const ageMs = Date.now() - Date.parse(featured.date);
  assert.ok(ageMs < 48 * 60 * 60 * 1000, `expected <48h freshness, got ${ageMs}ms`);
  const label = formatNewsRelativeTime(featured.date, Date.now());
  assert.equal(label.includes("day"), false, `stale label: ${label}`);
});

test("articleIndex news mapping applies rolling title before kickoff", () => {
  const articles = hub.getArticleIndexNewsArticles();
  const card = articles.find((a) =>
    a.link.includes("premier-league-2026-27-two-weeks-out"),
  );
  assert.ok(card);
  assert.equal(card.title.includes("Two Weeks"), false);
  assert.match(card.title, /Days to Kick-Off|Day to Kick-Off|Kick-Off Day/);
});
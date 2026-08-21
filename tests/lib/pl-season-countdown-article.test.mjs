import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const mod = await import("../../src/lib/content/pl-season-countdown-article.ts");
const hub = await import("../../src/lib/article-hub.ts");
const editorial = await import("../../src/lib/editorial-news.ts");
const seo = await import("../../src/lib/seo/article-seo.ts");
const { formatNewsRelativeTime } = await import("../../src/lib/news-format.ts");

// Frozen time instants used across all tests.
const AUG7 = Date.parse("2026-08-07T12:00:00.000Z"); // 14 days out
const AUG12 = Date.parse("2026-08-12T19:00:00.000Z"); // 9 days out
const AUG12_MORNING = Date.parse("2026-08-12T07:30:00.000Z"); // before 09:00Z stamp
const AUG20 = Date.parse("2026-08-20T12:00:00.000Z"); // 1 day out
const AUG21_MORNING = Date.parse("2026-08-21T06:00:00.000Z"); // kickoff day, before kickoff
const AUG21_AFTER = Date.parse("2026-08-21T20:00:00.000Z"); // after kickoff (19:00 UTC)
const AUG22 = Date.parse("2026-08-22T12:00:00.000Z"); // well after kickoff

describe("daysUntilPlSeasonKickoff", () => {
  it("returns 14 on original publish day", () => {
    assert.equal(mod.daysUntilPlSeasonKickoff(AUG7), 14);
  });

  it("returns 9 when 9 calendar days remain", () => {
    assert.equal(mod.daysUntilPlSeasonKickoff(AUG12), 9);
  });

  it("returns 1 the day before kickoff", () => {
    assert.equal(mod.daysUntilPlSeasonKickoff(AUG20), 1);
  });

  it("returns 0 on kickoff day morning (before kickoff time)", () => {
    assert.equal(mod.daysUntilPlSeasonKickoff(AUG21_MORNING), 0);
  });

  it("returns 0 after kickoff time", () => {
    assert.equal(mod.daysUntilPlSeasonKickoff(AUG21_AFTER), 0);
  });

  it("returns 0 well after kickoff", () => {
    assert.equal(mod.daysUntilPlSeasonKickoff(AUG22), 0);
  });
});

describe("isPlSeasonCountdownRolling", () => {
  it("is true before kickoff", () => {
    assert.equal(mod.isPlSeasonCountdownRolling(AUG7), true);
    assert.equal(mod.isPlSeasonCountdownRolling(AUG20), true);
    assert.equal(mod.isPlSeasonCountdownRolling(AUG21_MORNING), true);
  });

  it("is false after kickoff", () => {
    assert.equal(mod.isPlSeasonCountdownRolling(AUG21_AFTER), false);
    assert.equal(mod.isPlSeasonCountdownRolling(AUG22), false);
  });
});

describe("rollingPlSeasonCountdownPublishIso", () => {
  it("returns day stamp at 09:00Z when now is after 09:00Z", () => {
    assert.equal(
      mod.rollingPlSeasonCountdownPublishIso(AUG12),
      "2026-08-12T09:00:00.000Z",
    );
  });

  it("clamps to nowMs when before 09:00Z", () => {
    const stamp = mod.rollingPlSeasonCountdownPublishIso(AUG12_MORNING);
    assert.equal(stamp, new Date(AUG12_MORNING).toISOString());
    assert.ok(Date.parse(stamp) <= AUG12_MORNING);
  });

  it("returns day stamp on last rolling day (Aug 20)", () => {
    const stamp = mod.rollingPlSeasonCountdownPublishIso(AUG20);
    assert.equal(stamp, "2026-08-20T09:00:00.000Z");
  });

  it("returns null after kickoff", () => {
    assert.equal(mod.rollingPlSeasonCountdownPublishIso(AUG21_AFTER), null);
    assert.equal(mod.rollingPlSeasonCountdownPublishIso(AUG22), null);
  });
});

describe("plSeasonCountdownHeadline — countdown states", () => {
  it("shows Two Weeks on original publish day", () => {
    assert.match(mod.plSeasonCountdownHeadline(AUG7), /^Two Weeks to Kick-Off/);
  });

  it("shows N Days for intermediate counts (plural)", () => {
    assert.match(mod.plSeasonCountdownHeadline(AUG12), /^9 Days to Kick-Off/);
  });

  it("shows 1 Day for singular (1 day remaining)", () => {
    assert.match(mod.plSeasonCountdownHeadline(AUG20), /^1 Day to Kick-Off/);
    assert.doesNotMatch(mod.plSeasonCountdownHeadline(AUG20), /^1 Days/);
  });

  it("shows Kick-Off Day on kickoff day morning", () => {
    assert.match(mod.plSeasonCountdownHeadline(AUG21_MORNING), /^Kick-Off Day/);
  });

  it("shows Kick-Off Day after kickoff", () => {
    assert.match(mod.plSeasonCountdownHeadline(AUG21_AFTER), /^Kick-Off Day/);
    assert.match(mod.plSeasonCountdownHeadline(AUG22), /^Kick-Off Day/);
  });

  it("always includes the canonical title suffix", () => {
    const suffix = "Premier League 2026/27 Returns After Spain's World Cup Triumph";
    assert.ok(mod.plSeasonCountdownHeadline(AUG7).includes(suffix));
    assert.ok(mod.plSeasonCountdownHeadline(AUG12).includes(suffix));
    assert.ok(mod.plSeasonCountdownHeadline(AUG20).includes(suffix));
    assert.ok(mod.plSeasonCountdownHeadline(AUG21_AFTER).includes(suffix));
  });
});

describe("plSeasonCountdownBodyTiming — inline copy", () => {
  it("returns 'kicks off today' on kickoff day", () => {
    assert.equal(mod.plSeasonCountdownBodyTiming(AUG21_MORNING), "kicks off today");
    assert.equal(mod.plSeasonCountdownBodyTiming(AUG21_AFTER), "kicks off today");
  });

  it("returns 'kicks off tomorrow' the day before", () => {
    assert.equal(mod.plSeasonCountdownBodyTiming(AUG20), "kicks off tomorrow");
  });

  it("returns 'kicks off in N days' for multi-day counts", () => {
    assert.equal(mod.plSeasonCountdownBodyTiming(AUG12), "kicks off in 9 days");
    assert.equal(mod.plSeasonCountdownBodyTiming(AUG7), "kicks off in 14 days");
  });
});

describe("plSeasonCountdownDisplayDate", () => {
  it("returns rolling London date before kickoff", () => {
    const d = mod.plSeasonCountdownDisplayDate(AUG20);
    assert.ok(d.includes("August 2026"), `expected Aug 2026, got ${d}`);
    assert.ok(d.includes("20"), `expected 20th, got ${d}`);
  });

  it("returns static original publish date after kickoff", () => {
    assert.equal(mod.plSeasonCountdownDisplayDate(AUG21_AFTER), "7 August 2026");
    assert.equal(mod.plSeasonCountdownDisplayDate(AUG22), "7 August 2026");
  });
});

describe("stable datePublished", () => {
  it("PL_SEASON_COUNTDOWN_ORIGINAL_PUBLISH_ISO never changes", () => {
    assert.equal(
      mod.PL_SEASON_COUNTDOWN_ORIGINAL_PUBLISH_ISO,
      "2026-08-07T09:00:00.000Z",
    );
  });
});

describe("article-hub rolling freshness integration", () => {
  it("news card title updates daily based on nowMs", () => {
    const beforeKickoff = hub.getArticleIndexNewsArticles(AUG12);
    const card = beforeKickoff.find((a) =>
      a.link.includes("premier-league-2026-27-two-weeks-out"),
    );
    assert.ok(card, "countdown article should appear in news cards");
    assert.match(card.title, /^9 Days to Kick-Off/);

    const twoWeeksDay = hub.getArticleIndexNewsArticles(AUG7);
    const tw = twoWeeksDay.find((a) =>
      a.link.includes("premier-league-2026-27-two-weeks-out"),
    );
    assert.ok(tw);
    assert.match(tw.title, /^Two Weeks to Kick-Off/);
  });

  it("uses rolling publish date before kickoff for same-day freshness", () => {
    const cards = hub.getArticleIndexNewsArticles(AUG12);
    const card = cards.find((a) =>
      a.link.includes("premier-league-2026-27-two-weeks-out"),
    );
    assert.equal(card.date, "2026-08-12T09:00:00.000Z");
    const ageMs = AUG12 - Date.parse(card.date);
    assert.ok(ageMs < 48 * 60 * 60 * 1000, `stale news card: age is ${ageMs}ms`);
  });

  it("relative time is within same-day bucket on a rolling day", () => {
    const cards = hub.getArticleIndexNewsArticles(AUG12);
    const card = cards.find((a) =>
      a.link.includes("premier-league-2026-27-two-weeks-out"),
    );
    const label = formatNewsRelativeTime(card.date, AUG12);
    assert.ok(
      !label.toLowerCase().includes("day"),
      `expected recent label, got "${label}"`,
    );
  });

  it("falls back to static ARTICLE_INDEX date after kickoff", () => {
    const cards = hub.getArticleIndexNewsArticles(AUG22);
    const card = cards.find((a) =>
      a.link.includes("premier-league-2026-27-two-weeks-out"),
    );
    assert.ok(card);
    assert.equal(mod.rollingPlSeasonCountdownPublishIso(AUG22), null);
    assert.notEqual(card.date, "2026-08-22T09:00:00.000Z");
  });

  it("title shows Kick-Off Day after season starts", () => {
    const cards = hub.getArticleIndexNewsArticles(AUG22);
    const card = cards.find((a) =>
      a.link.includes("premier-league-2026-27-two-weeks-out"),
    );
    assert.match(card.title, /^Kick-Off Day/);
  });
});

describe("homepage news feed rolling integration", () => {
  it("featured countdown card is same-day fresh on a rolling day", () => {
    const feed = editorial.mergeHomepageNewsFeed([], AUG12);
    const card = feed.find((a) =>
      a.link.includes("premier-league-2026-27-two-weeks-out"),
    );
    assert.ok(card, "countdown card should appear in homepage feed");
    const ageMs = AUG12 - Date.parse(card.date);
    assert.ok(
      ageMs < 48 * 60 * 60 * 1000,
      `expected same-day freshness, got ${ageMs}ms`,
    );
  });
});

describe("article SEO integration", () => {
  it("datePublished stays stable (never rolls)", () => {
    const schema = seo.articleSeoFromSlug("premier-league-2026-27-two-weeks-out");
    assert.ok(schema);
    assert.equal(
      schema.datePublished,
      mod.PL_SEASON_COUNTDOWN_ORIGINAL_PUBLISH_ISO,
    );
  });

  it("headline matches current countdown state", () => {
    const schema = seo.articleSeoFromSlug("premier-league-2026-27-two-weeks-out");
    assert.ok(schema);
    assert.equal(schema.headline, mod.plSeasonCountdownHeadline());
  });

  it("dateModified is a valid ISO string and not the static index date", () => {
    const schema = seo.articleSeoFromSlug("premier-league-2026-27-two-weeks-out");
    assert.ok(schema);
    assert.ok(schema.dateModified);
    const parsed = Date.parse(schema.dateModified);
    assert.ok(Number.isFinite(parsed));
    assert.notEqual(schema.dateModified, "7 August 2026");
  });
});

describe("hero SVG stale-text check", () => {
  it("hero SVG does not contain hard-coded 7 August 2026 date", () => {
    const svg = readFileSync(
      join(
        root,
        "public/images/news/premier-league-2026-27-two-weeks-out/hero.svg",
      ),
      "utf8",
    );
    assert.equal(svg.includes("7 August 2026"), false);
  });

  it("hero SVG contains timeless 'updated daily' marker", () => {
    const svg = readFileSync(
      join(
        root,
        "public/images/news/premier-league-2026-27-two-weeks-out/hero.svg",
      ),
      "utf8",
    );
    assert.match(svg, /updated daily/);
  });
});

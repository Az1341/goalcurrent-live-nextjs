import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("homepage WC26 hard gate", async () => {
  const hub = await import("../../src/lib/article-hub.ts");
  const editorial = await import("../../src/lib/editorial-news.ts");
  const filter = await import("../../src/lib/news-wc26-filter.ts");

  it("isWorldCup2026Slug uses ARTICLES category only", () => {
    assert.equal(hub.isWorldCup2026Slug("world-cup-2026-complete-guide"), true);
    assert.equal(hub.isWorldCup2026Slug("premier-league-2026-27-preview"), false);
    // ARTICLE_INDEX-only slug with no ARTICLES row => unknown/false
    assert.equal(hub.isWorldCup2026Slug("world-cup-2026-june-22-recap"), false);
  });

  it("isWorldCup2026EditorialLink catches index-only WC26 recaps", () => {
    assert.equal(
      hub.isWorldCup2026EditorialLink("/articles/world-cup-2026-june-22-recap"),
      true,
    );
    assert.equal(
      hub.isWorldCup2026EditorialLink(
        "/worldcup2026/news/morocco-knock-out-netherlands-on-penalties",
        "morocco-knock-out-netherlands-on-penalties",
      ),
      true,
    );
    assert.equal(
      hub.isWorldCup2026EditorialLink("/articles/premier-league-2026-27-august-countdown"),
      false,
    );
  });

  it("mergeHomepageNewsFeed excludes injected WC26 editorial and partner RSS", () => {
    const partner = [
      {
        title: "Arsenal transfer latest",
        link: "https://example.com/arsenal-transfer",
        excerpt: "Premier League news",
        date: "2026-08-04T12:00:00.000Z",
        source: "BBC Sport",
        tag: "TRANSFER",
      },
      {
        title: "Messi fires Argentina into World Cup 2026 final",
        link: "https://example.com/wc26-messi",
        excerpt: "FIFA World Cup drama in New Jersey",
        date: "2026-08-04T18:00:00.000Z",
        source: "ESPN",
        tag: "RESULT",
      },
    ];
    const merged = editorial.mergeHomepageNewsFeed(partner);
    assert.equal(
      merged.some((a) => a.link === "https://example.com/wc26-messi"),
      false,
      "partner WC26 must be excluded",
    );
    assert.equal(
      merged.some((a) => filter.isWorldCup2026HomepageNewsItem(a)),
      false,
      "no WC26 item may remain in homepage feed",
    );
    assert.equal(
      merged.some((a) => a.link.includes("world-cup-2026") || a.link.includes("worldcup2026")),
      false,
    );
    // Newest non-WC26 editorial should pin when present
    if (merged.length > 0) {
      assert.equal(filter.isWorldCup2026HomepageNewsItem(merged[0]), false);
    }
    assert.ok(
      merged[0]?.link.includes("premier-league-2026-27-two-weeks-out"),
      "7 August PL preview must pin as homepage Latest News featured item",
    );
    assert.equal(
      hub.isWorldCup2026EditorialLink(
        "/articles/premier-league-2026-27-august-countdown",
      ),
      false,
      "1 July PL countdown page must remain a valid non-WC26 article",
    );
  });

  it("mergeWc26NewsFeed still includes WC26 GoalCurrent articles", () => {
    const merged = editorial.mergeWc26NewsFeed([]);
    assert.ok(
      merged.some((a) => hub.isWorldCup2026EditorialLink(a.link)),
      "WC26 feed must keep WC26 editorial pins",
    );
  });
});

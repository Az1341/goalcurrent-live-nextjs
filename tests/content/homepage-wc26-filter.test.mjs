import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("homepage WC26 hard gate and freshness", async () => {
  const hub = await import("../../src/lib/article-hub.ts");
  const editorial = await import("../../src/lib/editorial-news.ts");
  const filter = await import("../../src/lib/news-wc26-filter.ts");

  it("isWorldCup2026Slug uses ARTICLES category only", () => {
    assert.equal(hub.isWorldCup2026Slug("world-cup-2026-complete-guide"), true);
    assert.equal(hub.isWorldCup2026Slug("premier-league-2026-27-preview"), false);
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

  it("mergeHomepageNewsFeed excludes WC26 and ranks newest real reporting first", () => {
    const partner = [
      {
        title: "Fresh football news",
        link: "https://example.com/fresh-football-news",
        excerpt: "Current football reporting",
        date: "2026-08-15T06:30:00.000Z",
        source: "BBC Sport",
        tag: "NEWS",
      },
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
        date: "2026-08-15T06:45:00.000Z",
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
    assert.equal(
      merged[0]?.link,
      "https://example.com/fresh-football-news",
      "newer real partner reporting must outrank older GoalCurrent editorial",
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

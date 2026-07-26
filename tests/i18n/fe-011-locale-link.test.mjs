import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("FE-011: R2 example surfaces use locale-aware Link", () => {
  const fixture = readFileSync(
    join(root, "src/components/pl/PlFixtureCard.tsx"),
    "utf8",
  );
  const hub = readFileSync(
    join(root, "src/components/pl/PlHubClient.tsx"),
    "utf8",
  );
  const homeNews = readFileSync(
    join(root, "src/components/home/v5/HomeLatestNews.tsx"),
    "utf8",
  );

  for (const [name, raw] of [
    ["PlFixtureCard", fixture],
    ["PlHubClient", hub],
    ["HomeLatestNews", homeNews],
  ]) {
    assert.match(raw, /from ["']@\/i18n\/navigation["']/, name);
    assert.doesNotMatch(raw, /from ["']next\/link["']/, name);
  }
});

test("FE-011: remaining PL surfaces use locale-aware Link", () => {
  const clubs = readFileSync(
    join(root, "src/components/pl/PlClubsClient.tsx"),
    "utf8",
  );
  const match = readFileSync(
    join(root, "src/components/pl/PlMatchClient.tsx"),
    "utf8",
  );
  const live = readFileSync(
    join(root, "src/components/pl/PlLiveClient.tsx"),
    "utf8",
  );

  for (const raw of [clubs, match, live]) {
    assert.match(raw, /from ["']@\/i18n\/navigation["']/);
    assert.doesNotMatch(raw, /from ["']next\/link["']/);
  }
});

test("FE-011: remaining news surfaces use locale-aware Link", () => {
  const hub = readFileSync(
    join(root, "src/components/news/NewsHub.tsx"),
    "utf8",
  );
  const card = readFileSync(
    join(root, "src/components/news/NewsCard.tsx"),
    "utf8",
  );
  const article = readFileSync(
    join(root, "src/components/news/NewsArticleCard.tsx"),
    "utf8",
  );
  const category = readFileSync(
    join(root, "src/components/news/NewsCategoryFeed.tsx"),
    "utf8",
  );
  const editorial = readFileSync(
    join(root, "src/components/news/EditorialArticleView.tsx"),
    "utf8",
  );

  for (const raw of [hub, card, article, category, editorial]) {
    assert.match(raw, /from ["']@\/i18n\/navigation["']/);
    assert.doesNotMatch(raw, /from ["']next\/link["']/);
  }
});

test("FE-011: internal destinations stay unprefixed pathnames for Link", () => {
  const fixture = readFileSync(
    join(root, "src/components/pl/PlFixtureCard.tsx"),
    "utf8",
  );
  const hub = readFileSync(
    join(root, "src/components/pl/PlHubClient.tsx"),
    "utf8",
  );
  const news = readFileSync(
    join(root, "src/components/home/v5/HomeLatestNews.tsx"),
    "utf8",
  );

  assert.match(fixture, /href=\{`\/premier-league\/match\/\$\{/);
  assert.match(hub, /href=["']\/premier-league\/table["']/);
  assert.match(news, /href=["']\/news["']/);
  assert.match(news, /isExternalLink/);
  assert.match(news, /<a[\s\S]*target="_blank"/);
});

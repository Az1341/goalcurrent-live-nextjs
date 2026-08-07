import assert from "node:assert/strict";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ogMod = pathToFileURL(join(root, "src/lib/seo/article-og-image.tsx")).href;
const hubMod = pathToFileURL(join(root, "src/lib/article-hub.ts")).href;
const articlesMod = pathToFileURL(join(root, "src/data/articles.ts")).href;

test("dedicated ARTICLE_CARD_IMAGES keep absolute card art URLs", async () => {
  const { resolveArticleShareImageUrl, hasDedicatedArticleCardImage } =
    await import(ogMod);
  const { ARTICLE_CARD_IMAGES } = await import(hubMod);

  const slug = "spain-world-cup-2026-champion-masterclass";
  assert.equal(hasDedicatedArticleCardImage(slug), true);
  assert.equal(
    resolveArticleShareImageUrl(slug),
    `https://goalcurrent.live${ARTICLE_CARD_IMAGES[slug]}`,
  );
});

test("articles without dedicated art resolve to generated OG API path", async () => {
  const {
    resolveArticleShareImageUrl,
    hasDedicatedArticleCardImage,
    resolveArticleOgTitle,
    resolveArticleOgCategory,
  } = await import(ogMod);

  const slug = "football-as-an-industry";
  assert.equal(hasDedicatedArticleCardImage(slug), false);
  assert.equal(
    resolveArticleShareImageUrl(slug),
    `https://goalcurrent.live/api/og/article/${slug}`,
  );
  assert.equal(
    resolveArticleOgTitle(slug),
    "The Machine Behind the Magic — How Football Became the World's Biggest Industry",
  );
  assert.equal(resolveArticleOgCategory(slug), "Editorial");
});

test("category labels come from real article data", async () => {
  const { resolveArticleOgCategory, resolveArticleOgTitle } = await import(ogMod);
  const { ARTICLES } = await import(articlesMod);

  const pl = ARTICLES.find((a) => a.category === "premier-league");
  const cl = ARTICLES.find((a) => a.category === "champions-league");
  const wc = ARTICLES.find((a) => a.category === "world-cup-2026");

  assert.ok(pl);
  assert.ok(cl);
  assert.ok(wc);
  assert.equal(resolveArticleOgCategory(pl.slug), "Premier League");
  assert.equal(resolveArticleOgCategory(cl.slug), "Champions League");
  assert.equal(resolveArticleOgCategory(wc.slug), "World Cup 2026");
  assert.equal(resolveArticleOgTitle(pl.slug), pl.title);
  assert.equal(resolveArticleOgTitle(cl.slug), cl.title);
});

test("canonical slug coverage: dedicated vs generated share images", async () => {
  const { hasDedicatedArticleCardImage } = await import(ogMod);
  const { getAllCanonicalArticleSlugs } = await import(articlesMod);

  const slugs = getAllCanonicalArticleSlugs();
  const dedicated = slugs.filter((slug) => hasDedicatedArticleCardImage(slug));
  const generated = slugs.filter((slug) => !hasDedicatedArticleCardImage(slug));

  assert.ok(slugs.length > dedicated.length);
  assert.equal(dedicated.length + generated.length, slugs.length);
  assert.ok(dedicated.length >= 10);
  assert.ok(generated.length >= 1);
});

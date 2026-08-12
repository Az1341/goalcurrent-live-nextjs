import {
  ARTICLE_INDEX,
  ARTICLES,
  articleHref,
  type ArticleIndexEntry,
} from "@/data/articles";
import { EDITORIAL_ARTICLES } from "@/data/editorial";
import {
  PL_SEASON_COUNTDOWN_ARTICLE_SLUG,
  plSeasonCountdownHeadline,
  rollingPlSeasonCountdownPublishIso,
} from "@/lib/content/pl-season-countdown-article";
import { EDITORIAL_SOURCE_LABEL } from "@/lib/seo/constants";
import { toIsoDate } from "@/lib/seo/dates";
import type { NewsArticle } from "@/types/news";

/** Card / news hub images for editorial articles (local paths). */
export const ARTICLE_CARD_IMAGES: Record<string, string> = {
  "world-cup-2026-june-22-recap": "/images/football-hero-bg.jpg",
  "world-cup-2026-june-23-recap": "/images/football-hero-bg.jpg",
  "fifa-world-cup-2026-head-to-head-rule-early-elimination":
    "/images/news/fifa-world-cup-2026-head-to-head-rule-early-elimination/hero.svg",
  "morocco-knock-out-netherlands-on-penalties":
    "/images/news/morocco-knock-out-netherlands-on-penalties/hero.svg",
  "world-cup-2026-june-30-recap":
    "/images/news/world-cup-2026-june-30-recap/hero.svg",
  "premier-league-2026-27-two-weeks-out":
    "/images/news/premier-league-2026-27-two-weeks-out/hero.svg",
  "premier-league-2026-27-august-countdown":
    "/images/news/premier-league-2026-27-august-countdown/hero.svg",
  "world-cup-2026-july-1-recap":
    "/images/news/world-cup-2026-july-1-recap/hero.svg",
  "england-advance-to-face-mexico-round-of-16":
    "/images/news/england-advance-to-face-mexico-round-of-16/hero.svg",
  "world-cup-2026-july-3-recap":
    "/images/news/world-cup-2026-july-3-recap/hero.svg",
  "england-argentina-world-cup-semifinal-analysis":
    "/images/news/england-argentina-world-cup-semifinal-analysis/hero.svg",
  "england-france-third-place-preview":
    "/images/news/england-france-third-place-preview/hero.svg",
  "england-6-4-france-third-place-recap":
    "/images/news/england-6-4-france-third-place-recap/hero.jpg",
  "spain-world-cup-2026-champion-masterclass":
    "/images/news/spain-world-cup-2026-champion-masterclass/hero.svg",
};

const DEFAULT_ARTICLE_CARD_IMAGE = "/images/football-hero-bg.jpg";

export function getArticleCardImage(slug: string): string {
  return ARTICLE_CARD_IMAGES[slug] ?? DEFAULT_ARTICLE_CARD_IMAGE;
}

/** SVG card art must bypass the Next.js image optimizer (same as article pages). */
export function isArticleCardImageUnoptimized(src: string): boolean {
  return src.endsWith(".svg");
}

export function getEditorialNewsArticles(): NewsArticle[] {
  return EDITORIAL_ARTICLES.map((article) => ({
    title: article.title,
    link: article.path,
    excerpt: article.excerpt,
    date: article.publishedAt,
    source: EDITORIAL_SOURCE_LABEL,
    tag: "FEATURE" as const,
    image: getArticleCardImage(article.slug),
  }));
}

function newsTagFromIndexCategory(category: string): NewsArticle["tag"] {
  if (category === "Match Recap" || category === "Match Report") {
    return "RESULT";
  }
  if (category === "Preview") {
    return "PREVIEW";
  }
  return "FEATURE";
}

function articleIndexEntryToNewsArticle(
  entry: ArticleIndexEntry,
  nowMs: number = Date.now(),
): NewsArticle {
  const isRollingCountdown = entry.slug === PL_SEASON_COUNTDOWN_ARTICLE_SLUG;
  const rollingDate = isRollingCountdown
    ? rollingPlSeasonCountdownPublishIso(nowMs)
    : null;

  return {
    title: isRollingCountdown
      ? plSeasonCountdownHeadline(nowMs)
      : entry.title,
    link: entry.href ?? articleHref(entry.slug),
    excerpt: entry.excerpt,
    date: rollingDate ?? toIsoDate(entry.date),
    source: EDITORIAL_SOURCE_LABEL,
    tag: newsTagFromIndexCategory(entry.category),
    image: getArticleCardImage(entry.slug),
  };
}

function sortNewsByDateDesc(articles: readonly NewsArticle[]): NewsArticle[] {
  return [...articles].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

/**
 * True when `slug` maps to ARTICLES with competition category world-cup-2026.
 * Unmatched ARTICLE_INDEX-only slugs return false (unknown) — callers that need
 * a hard homepage gate should also use slug/path/title signals.
 */
export function isWorldCup2026Slug(slug: string): boolean {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return false;
  const article = ARTICLES.find((entry) => entry.slug === normalized);
  return article?.category === "world-cup-2026";
}

/** Extract article slug from a news link when possible. */
export function slugFromNewsLink(link: string): string | null {
  const trimmed = link.trim();
  if (!trimmed) return null;
  const worldcupNews = trimmed.match(/\/worldcup2026\/news\/([^/?#]+)/i);
  if (worldcupNews?.[1]) return decodeURIComponent(worldcupNews[1]);
  const articlesPath = trimmed.match(/\/articles\/([^/?#]+)/i);
  if (articlesPath?.[1]) return decodeURIComponent(articlesPath[1]);
  return null;
}

/**
 * Homepage / hard-gate WC26 detection for GoalCurrent editorial cards.
 * Uses ARTICLES.category when present; otherwise slug/path WC26 signals
 * (needed because most ARTICLE_INDEX slugs have no ARTICLES counterpart).
 */
export function isWorldCup2026EditorialLink(link: string, slug?: string): boolean {
  const resolvedSlug = (slug ?? slugFromNewsLink(link) ?? "").toLowerCase();
  if (resolvedSlug && isWorldCup2026Slug(resolvedSlug)) {
    return true;
  }
  if (
    resolvedSlug &&
    (resolvedSlug.includes("world-cup") ||
      resolvedSlug.includes("fifa-world-cup-2026") ||
      resolvedSlug.includes("worldcup2026"))
  ) {
    return true;
  }
  if (/\/worldcup2026(\/|$)/i.test(link)) {
    return true;
  }
  // Index-only WC26 match reports without year token in the slug.
  if (
    resolvedSlug === "morocco-knock-out-netherlands-on-penalties" ||
    resolvedSlug === "england-advance-to-face-mexico-round-of-16" ||
    resolvedSlug === "england-france-third-place-preview" ||
    resolvedSlug === "england-6-4-france-third-place-recap"
  ) {
    return true;
  }
  return false;
}

/** All GoalCurrent articles from ARTICLE_INDEX as news cards, newest first. */
export function getArticleIndexNewsArticles(
  nowMs: number = Date.now(),
): NewsArticle[] {
  return sortNewsByDateDesc(
    [...ARTICLE_INDEX].map((entry) =>
      articleIndexEntryToNewsArticle(entry, nowMs),
    ),
  );
}

/** GoalCurrent editorial + index articles for news feeds — pinned above partner RSS. */
export function getPinnedGoalCurrentNewsArticles(): NewsArticle[] {
  const seen = new Set<string>();
  const merged: NewsArticle[] = [];

  for (const article of [
    ...getArticleIndexNewsArticles(),
    ...getEditorialNewsArticles(),
  ]) {
    if (seen.has(article.link)) {
      continue;
    }
    seen.add(article.link);
    merged.push(article);
  }

  return sortNewsByDateDesc(merged);
}

export function getLatestMatchRecap(): ArticleIndexEntry | undefined {
  const recaps = ARTICLE_INDEX.filter((entry) => entry.category === "Match Recap");
  return recaps.length > 0 ? recaps[recaps.length - 1] : undefined;
}

/** Newest non-WC26 GoalCurrent articles first for the homepage grid. */
export function getHomepageArticles(limit = 3): ArticleIndexEntry[] {
  return [...ARTICLE_INDEX]
    .filter(
      (entry) =>
        !isWorldCup2026EditorialLink(
          entry.href ?? articleHref(entry.slug),
          entry.slug,
        ),
    )
    .sort((a, b) => toIsoDate(b.date).localeCompare(toIsoDate(a.date)))
    .slice(0, limit);
}

export function getMatchRecapNewsArticles(): NewsArticle[] {
  return sortNewsByDateDesc(
    ARTICLE_INDEX.filter((entry) => entry.category === "Match Recap").map((entry) =>
      articleIndexEntryToNewsArticle(entry),
    ),
  );
}
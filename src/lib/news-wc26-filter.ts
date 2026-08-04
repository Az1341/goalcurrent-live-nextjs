import {
  isWorldCup2026EditorialLink,
  slugFromNewsLink,
} from "@/lib/article-hub";
import type { NewsArticle } from "@/types/news";

/**
 * Partner RSS payload shape (from ContentItem -> NewsArticle):
 * title, link (url), excerpt (description), date, source, tag, optional image.
 * No competition/category field — detect WC26 via title/link/excerpt text.
 *
 * Pattern (deliberately tighter than readers.ts inclusion keywords):
 * avoid bare "fifa", "group stage", or "knockout" which false-positive
 * on non-WC26 partner stories.
 */
const PARTNER_WC26_SIGNALS = [
  "world cup 2026",
  "world-cup-2026",
  "fifa world cup",
  "fifa worldcup",
  "wc26",
  "wc2026",
  "wc 2026",
  "/worldcup2026/",
  "worldcup2026",
] as const;

export function isWorldCup2026PartnerNewsItem(
  article: Pick<NewsArticle, "title" | "link" | "excerpt">,
): boolean {
  const text = `${article.title} ${article.excerpt} ${article.link}`.toLowerCase();
  return PARTNER_WC26_SIGNALS.some((signal) => text.includes(signal));
}

/** Homepage hard gate for any news card (editorial or partner). */
export function isWorldCup2026HomepageNewsItem(article: NewsArticle): boolean {
  const slug = slugFromNewsLink(article.link) ?? undefined;
  if (isWorldCup2026EditorialLink(article.link, slug)) {
    return true;
  }
  return isWorldCup2026PartnerNewsItem(article);
}

export function excludeWorldCup2026NewsItems<T extends NewsArticle>(
  articles: readonly T[],
): T[] {
  return articles.filter((article) => !isWorldCup2026HomepageNewsItem(article));
}

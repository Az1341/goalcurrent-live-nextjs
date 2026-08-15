import {
  getArticleIndexNewsArticles,
  getPinnedGoalCurrentNewsArticles,
  isWorldCup2026EditorialLink,
} from "@/lib/article-hub";
import {
  excludeWorldCup2026NewsItems,
  isWorldCup2026HomepageNewsItem,
} from "@/lib/news-wc26-filter";
import type { NewsArticle } from "@/types/news";

export { getEditorialNewsArticles } from "@/lib/article-hub";

function newsSortKey(article: NewsArticle): number {
  const parsed = Date.parse(article.date);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortNewsByDateDesc(articles: readonly NewsArticle[]): NewsArticle[] {
  return [...articles].sort((a, b) => newsSortKey(b) - newsSortKey(a));
}

/** Partner RSS only — sorted newest first. */
export function sortPartnerNewsFeed(articles: readonly NewsArticle[]): NewsArticle[] {
  return sortNewsByDateDesc(articles);
}

/**
 * Homepage current-news contract: combine non-WC26 GoalCurrent editorial with
 * non-WC26 partner RSS, dedupe by canonical link, then rank every item by its
 * real publish timestamp. No old GoalCurrent article is artificially pinned
 * above newer reporting. WC26 remains isolated to its historical surfaces.
 */
export function mergeHomepageNewsFeed(articles: readonly NewsArticle[]): NewsArticle[] {
  const editorial = getArticleIndexNewsArticles().filter(
    (item) => !isWorldCup2026EditorialLink(item.link),
  );
  const partner = excludeWorldCup2026NewsItems(articles).filter(
    (item) => !isWorldCup2026HomepageNewsItem(item),
  );

  const byLink = new Map<string, NewsArticle>();
  for (const item of [...editorial, ...partner]) {
    if (!byLink.has(item.link)) {
      byLink.set(item.link, item);
    }
  }

  return sortNewsByDateDesc([...byLink.values()]);
}

/** GoalCurrent articles stay first; partner RSS follows, each block sorted by date. */
export function mergeEditorialFirst(articles: readonly NewsArticle[]): NewsArticle[] {
  const pinned = getPinnedGoalCurrentNewsArticles();
  const pinnedLinks = new Set(pinned.map((item) => item.link));
  const rest = sortNewsByDateDesc(
    articles.filter((item) => !pinnedLinks.has(item.link)),
  );
  return [...pinned, ...rest];
}

/** World Cup news — GoalCurrent articles pinned above partner RSS. */
export function mergeWc26NewsFeed(articles: readonly NewsArticle[]): NewsArticle[] {
  const pinned = getPinnedGoalCurrentNewsArticles().filter(
    (item) => !item.link.includes("/premier-league-2026-27-august-countdown"),
  );
  const pinnedLinks = new Set(pinned.map((item) => item.link));
  const rest = sortNewsByDateDesc(
    articles.filter((item) => !pinnedLinks.has(item.link)),
  );
  return [...pinned, ...rest];
}

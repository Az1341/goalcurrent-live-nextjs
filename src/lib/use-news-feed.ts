"use client";

import useSWR from "swr";
import { fetcher, visibilityAwareRefreshInterval } from "@/lib/client/fetcher";
import type { NewsApiResponse, NewsArticle } from "@/types/news";

/** Canonical client news path — single SWR ownership (FE-009). */
export const NEWS_API_PATH = "/api/news";

const NEWS_REFRESH_MS = 900_000;
const NEWS_DEDUP_MS = 60_000;

export type NewsFeedSnapshot = {
  readonly articles: readonly NewsArticle[];
  readonly sources: readonly string[];
  readonly fetched: string | undefined;
  readonly loading: boolean;
  readonly error: boolean;
  readonly data: NewsApiResponse | undefined;
};

type UseNewsFeedOptions = {
  /** SSR/hydration seed for the news hub route. */
  fallbackData?: NewsApiResponse;
  /**
   * Homepage hard gate — requests `/api/news?excludeWc26=1` so partner RSS
   * never includes WC26. Uses a separate SWR key from the shared feed.
   */
  excludeWc26?: boolean;
};

/**
 * Client owner for `/api/news`.
 * Homepage should pass `excludeWc26: true`. Other surfaces keep the shared path.
 * The browser checks every 15 minutes while visible; the CDN absorbs repeated
 * visitor requests inside the same freshness window.
 */
export function useNewsFeed(options?: UseNewsFeedOptions): NewsFeedSnapshot {
  const path = options?.excludeWc26
    ? `${NEWS_API_PATH}?excludeWc26=1`
    : NEWS_API_PATH;
  const { data, error: swrError, isLoading } = useSWR<NewsApiResponse>(
    path,
    fetcher,
    {
      fallbackData: options?.fallbackData,
      refreshInterval: () => visibilityAwareRefreshInterval(NEWS_REFRESH_MS),
      dedupingInterval: NEWS_DEDUP_MS,
      revalidateOnFocus: true,
      focusThrottleInterval: NEWS_DEDUP_MS,
      revalidateOnReconnect: true,
    },
  );

  const articles = data?.articles ?? [];
  const hasArticles = articles.length > 0;
  const emptyPayload = Boolean(data && !hasArticles);
  const loading = Boolean(isLoading && !hasArticles);
  const error = Boolean((swrError || emptyPayload || data?.error) && !hasArticles);

  return {
    articles,
    sources: data?.sources ?? [],
    fetched: data?.fetched,
    loading,
    error,
    data,
  };
}

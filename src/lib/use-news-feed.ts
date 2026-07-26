"use client";

import useSWR from "swr";
import { fetcher, visibilityAwareRefreshInterval } from "@/lib/client/fetcher";
import type { NewsApiResponse, NewsArticle } from "@/types/news";

/** Canonical client news path — single SWR ownership (FE-009). */
export const NEWS_API_PATH = "/api/news";

const NEWS_REFRESH_MS = 3_600_000;
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
};

/**
 * Single client owner for `/api/news`.
 * All route surfaces (home, profile, group, /news) must use this hook.
 */
export function useNewsFeed(options?: UseNewsFeedOptions): NewsFeedSnapshot {
  const { data, error: swrError, isLoading } = useSWR<NewsApiResponse>(
    NEWS_API_PATH,
    fetcher,
    {
      fallbackData: options?.fallbackData,
      refreshInterval: () => visibilityAwareRefreshInterval(NEWS_REFRESH_MS),
      dedupingInterval: NEWS_DEDUP_MS,
      revalidateOnFocus: false,
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

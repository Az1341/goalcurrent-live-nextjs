import { NextResponse } from "next/server";
import { parseSearchParams } from "@/lib/api/response";
import { captureRouteError } from "@/lib/log";
import { fetchNewsFeed, parseNewsFeedCategory } from "@/content/readers";
import { excludeWorldCup2026NewsItems } from "@/lib/news-wc26-filter";
import { newsCategoryQuerySchema } from "@/lib/validation/schemas";
import type { NewsApiResponse } from "@/types/news";

const NEWS_S_MAXAGE_SECONDS = 900;
const NEWS_STALE_WHILE_REVALIDATE_SECONDS = 300;

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const parsed = parseSearchParams(searchParams, newsCategoryQuerySchema);
  if ("error" in parsed) {
    return parsed.error;
  }
  const category = parseNewsFeedCategory(parsed.data.category);
  const excludeWc26 = Boolean(parsed.data.excludeWc26);

  try {
    const payload = await fetchNewsFeed(category);
    // Homepage requests `excludeWc26=1`. Do not strip WC26 from the shared
    // default `/api/news` payload — GroupHub / NewsHub still need it.
    const articles =
      excludeWc26 && category === "all"
        ? excludeWorldCup2026NewsItems(payload.articles)
        : payload.articles;
    const response: NewsApiResponse = {
      ...payload,
      articles,
      count: articles.length,
    };
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": `public, s-maxage=${NEWS_S_MAXAGE_SECONDS}, stale-while-revalidate=${NEWS_STALE_WHILE_REVALIDATE_SECONDS}`,
      },
    });
  } catch (error) {
    captureRouteError("api/news", error);
    const empty: NewsApiResponse = {
      articles: [],
      sources: [],
      count: 0,
      fetched: new Date().toISOString(),
      error: "Failed to fetch news",
    };
    return NextResponse.json(empty, {
      status: 500,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  }
}

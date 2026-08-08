export const dynamic = "force-dynamic";
export const revalidate = 300;

import type { Metadata } from "next";
import NewsCategoryFeed from "@/components/news/NewsCategoryFeed";
import { fetchNewsFeed } from "@/lib/news-rss";
import { mergeWc26NewsFeed } from "@/lib/editorial-news";
import { buildPageMetadata } from "@/lib/page-metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "World Cup 2026 News | GoalCurrent.live",
    description:
      "Latest FIFA World Cup 2026 news from BBC Sport and ESPN on GoalCurrent.live.",
    path: "/news/world-cup/",
    absoluteTitle: true,
    locale,
  });
}

export default async function WorldCupNewsPage() {
  const { articles, sources } = await fetchNewsFeed("wc26");
  const merged = mergeWc26NewsFeed(articles);

  if (!merged.length) {
    return (
      <main>
        <p className="text-center text-gray-400 py-4">
          Unable to load data. Please try again shortly.
        </p>
      </main>
    );
  }

  return (
    <NewsCategoryFeed
      heading="World Cup 2026"
      headingAccent="News"
      intro="World Cup 2026 headlines from BBC Sport and ESPN — refreshed hourly."
      articles={merged}
      sources={sources}
      emptyMessage="No World Cup news available right now. Check back soon."
    />
  );
}

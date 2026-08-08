import type { Metadata } from "next";
import NewsCategoryFeed from "@/components/news/NewsCategoryFeed";
import { withNewsFallback } from "@/lib/content-fallback";
import { fetchNewsFeed } from "@/lib/news-rss";
import { buildPageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Premier League News | GoalCurrent.live",
    description:
      "Latest Premier League news from BBC Sport and ESPN on GoalCurrent.live.",
    path: "/news/premier-league/",
    absoluteTitle: true,
    locale,
  });
}

export default async function PremierLeagueNewsPage() {
  const { articles, sources } = await fetchNewsFeed("pl");

  return (
    <NewsCategoryFeed
      heading="Premier League"
      headingAccent="News"
      intro="Premier League headlines from BBC Sport and ESPN — refreshed hourly."
      articles={withNewsFallback(articles)}
      sources={sources}
      emptyMessage="No Premier League news right now. Check back soon."
    />
  );
}

import type { Metadata } from "next";
import VideoCategoryFeed from "@/components/videos/VideoCategoryFeed";
import { withVideoFallback } from "@/components/videos/videos-fallback";
import { fetchYouTubeVideos } from "@/lib/youtube-videos";
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
    title: "Premier League Videos 2026/27 | GoalCurrent.live",
    description:
      "Premier League 2026/27 highlights and clips on GoalCurrent.live.",
    path: "/videos/premier-league/",
    absoluteTitle: true,
    locale,
  });
}

export default async function PremierLeagueVideosPage() {
  const { videos } = await fetchYouTubeVideos("pl", 12);

  return (
    <VideoCategoryFeed
      heading="Premier League"
      headingAccent="Videos"
      intro="Premier League 2026/27 football highlights from YouTube — refreshed hourly."
      videos={withVideoFallback(videos, 12, "pl")}
      emptyMessage="No Premier League football videos available right now."
    />
  );
}

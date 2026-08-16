import type { YouTubeVideo } from "@/types/video";
import type { VideoFeedCategory } from "@/lib/youtube-videos";
import { SITE_NAME } from "@/lib/site-url";

const WORLD_CUP_FALLBACK_ITEMS: readonly YouTubeVideo[] = [
  {
    videoId: "wc26-fallback-1",
    title: "FIFA World Cup 2026 — Match Highlights Hub",
    description: "Follow World Cup goals and major moments with GoalCurrent.live.",
    publishedAt: "",
    thumbnail: "/images/football-hero-bg.jpg",
    channelTitle: SITE_NAME,
    url: "https://www.youtube.com/@FIFA",
  },
  {
    videoId: "wc26-fallback-2",
    title: "World Cup 2026 — Group Stage Archive",
    description: "Review the tournament groups, results and qualification picture.",
    publishedAt: "",
    thumbnail: "/images/football-hero-bg.jpg",
    channelTitle: SITE_NAME,
    url: "/worldcup2026/groups",
  },
  {
    videoId: "wc26-fallback-3",
    title: "World Cup 2026 — Knockout Bracket",
    description: "Review the completed knockout route and match results.",
    publishedAt: "",
    thumbnail: "/images/football-hero-bg.jpg",
    channelTitle: SITE_NAME,
    url: "/worldcup2026/bracket",
  },
];

const PREMIER_LEAGUE_FALLBACK_ITEMS: readonly YouTubeVideo[] = [
  {
    videoId: "pl-fallback-1",
    title: "Premier League 2026/27 — Fixtures",
    description: "Browse the new-season Premier League fixture schedule.",
    publishedAt: "",
    thumbnail: "/images/hero-home.png",
    channelTitle: SITE_NAME,
    url: "/premier-league/fixtures",
  },
  {
    videoId: "pl-fallback-2",
    title: "Premier League 2026/27 — Table",
    description: "Follow the league table throughout the season.",
    publishedAt: "",
    thumbnail: "/images/hero-home.png",
    channelTitle: SITE_NAME,
    url: "/premier-league/table",
  },
  {
    videoId: "pl-fallback-3",
    title: "Premier League 2026/27 — Live Scores",
    description: "Follow live Premier League matches and match centres.",
    publishedAt: "",
    thumbnail: "/images/hero-home.png",
    channelTitle: SITE_NAME,
    url: "/premier-league/live",
  },
];

const GENERAL_FALLBACK_ITEMS: readonly YouTubeVideo[] = [
  ...PREMIER_LEAGUE_FALLBACK_ITEMS,
  ...WORLD_CUP_FALLBACK_ITEMS,
];

function fallbackItems(category: VideoFeedCategory): readonly YouTubeVideo[] {
  if (category === "wc") return WORLD_CUP_FALLBACK_ITEMS;
  if (category === "pl") return PREMIER_LEAGUE_FALLBACK_ITEMS;
  return GENERAL_FALLBACK_ITEMS;
}

export function withVideoFallback(
  videos: readonly YouTubeVideo[],
  limit = 4,
  category: VideoFeedCategory = "all",
): YouTubeVideo[] {
  if (videos.length > 0) {
    return [...videos].slice(0, limit);
  }
  return [...fallbackItems(category)].slice(0, limit);
}

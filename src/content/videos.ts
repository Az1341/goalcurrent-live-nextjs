import type { VideoItem } from "@/content/types";
import { contentIdFromUrl } from "@/content/merge";
import { extractYouTubeVideoId } from "@/utils/rss/parse";
import type { ParsedRssItem } from "@/utils/rss/parse";
import type { YouTubeVideo } from "@/types/video";
import { fetchScoreBatFeed } from "@/lib/scorebat/request";

type ScoreBatVideo = {
  title?: string;
  embed?: string;
};

type ScoreBatMatch = {
  title?: string;
  competition?: string;
  thumbnail?: string;
  date?: string;
  videos?: ScoreBatVideo[];
};

type ScoreBatResponse = {
  response?: ScoreBatMatch[];
};

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function youTubeVideoToItem(video: YouTubeVideo): VideoItem {
  return {
    id: contentIdFromUrl(video.url),
    title: video.title,
    description: video.description,
    url: video.url,
    thumbnail: video.thumbnail,
    publishedAt: video.publishedAt || new Date().toISOString(),
    source: video.channelTitle || "YouTube",
    kind: "video",
    embedUrl: youtubeEmbedUrl(video.videoId),
  };
}

function embedUrlFromScoreBatHtml(embed: string): string | null {
  const srcMatch = embed.match(/src=["']([^"']+)["']/i);
  return srcMatch?.[1]?.trim() ?? null;
}

export async function fetchScoreBatVideos(): Promise<VideoItem[]> {
  try {
    const response = await fetchScoreBatFeed({
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    if (!response?.ok) {
      return [];
    }

    const json = (await response.json()) as ScoreBatResponse;
    const items: VideoItem[] = [];

    for (const match of json.response ?? []) {
      const competition = (match.competition ?? match.title ?? "").toLowerCase();
      const isFootball =
        competition.includes("football") ||
        competition.includes("soccer") ||
        competition.includes("world cup") ||
        competition.includes("premier league") ||
        competition.includes("fifa");

      if (!isFootball && (match.videos ?? []).length === 0) {
        continue;
      }

      for (const video of match.videos ?? []) {
        const embed = video.embed?.trim();
        const title = video.title?.trim() || match.title?.trim();
        if (!embed || !title) {
          continue;
        }

        const embedUrl = embedUrlFromScoreBatHtml(embed);
        if (!embedUrl) {
          continue;
        }

        const watchUrl = embedUrl.includes("scorebat.com")
          ? embedUrl
          : `https://www.scorebat.com/embed/${encodeURIComponent(title)}`;

        items.push({
          id: contentIdFromUrl(embedUrl),
          title,
          description: match.title?.trim() || title,
          url: watchUrl,
          thumbnail: match.thumbnail,
          publishedAt: match.date
            ? new Date(match.date).toISOString()
            : new Date().toISOString(),
          source: "ScoreBat",
          kind: "video",
          embedUrl,
        });
      }
    }

    return items;
  } catch {
    return [];
  }
}

export function rssVideoItemsToVideoItems(
  rssItems: ParsedRssItem[],
  source: string,
): VideoItem[] {
  const items: VideoItem[] = [];

  for (const item of rssItems) {
    if (!item.videoUrl) {
      continue;
    }
    const videoId = extractYouTubeVideoId(item.videoUrl);
    if (!videoId) {
      continue;
    }

    items.push({
      id: contentIdFromUrl(item.videoUrl),
      title: item.title,
      description: item.description,
      url: item.videoUrl,
      thumbnail:
        item.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      publishedAt: item.publishedAt,
      source,
      kind: "video",
      embedUrl: youtubeEmbedUrl(videoId),
    });
  }

  return items;
}

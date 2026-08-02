import type { ContentItem, VideoItem } from "@/content/types";
import { plainTextFromHtml } from "@/content/merge";
import {
  sanitizeRemoteImageUrl,
  upgradeRemoteNewsImageUrl,
} from "@/lib/images";
import type { NewsArticle, NewsTag } from "@/types/news";
import type { YouTubeVideo } from "@/types/video";

function tagFromText(text: string): NewsTag {
  const low = text.toLowerCase();
  if (
    low.includes("injur") ||
    low.includes("fitness") ||
    low.includes("doubt") ||
    low.includes("ruled out")
  ) {
    return "INJURY";
  }
  if (
    low.includes("squad") ||
    low.includes("named") ||
    low.includes("call-up") ||
    low.includes("callup")
  ) {
    return "SQUAD";
  }
  if (low.includes("preview") || low.includes("prediction")) {
    return "PREVIEW";
  }
  if (
    low.includes("result") ||
    low.includes(" win") ||
    low.includes("beat") ||
    low.includes("score") ||
    low.includes("goal")
  ) {
    return "RESULT";
  }
  if (
    low.includes("breaking") ||
    low.includes("confirm") ||
    low.includes("official")
  ) {
    return "BREAKING";
  }
  if (
    low.includes("transfer") ||
    low.includes("sign") ||
    low.includes("deal")
  ) {
    return "TRANSFER";
  }
  return "NEWS";
}

export function formatNewsSource(source: string): string {
  const trimmed = source.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  try {
    const host = new URL(trimmed).hostname.replace(/^www\./, "");
    if (host.includes("bbc.co")) return "BBC Sport";
    if (host.includes("theguardian")) return "The Guardian";
    if (host.includes("espn")) return "ESPN";
    return host;
  } catch {
    return trimmed;
  }
}

export function contentItemToNewsArticle(item: ContentItem): NewsArticle {
  const thumbnail = item.thumbnail
    ? upgradeRemoteNewsImageUrl(sanitizeRemoteImageUrl(item.thumbnail))
    : undefined;

  return {
    title: plainTextFromHtml(item.title),
    link: item.url,
    excerpt: plainTextFromHtml(item.description),
    date: item.publishedAt,
    source: formatNewsSource(item.source),
    tag: tagFromText(`${item.title} ${item.description}`),
    ...(thumbnail ? { image: thumbnail } : {}),
  };
}

export function videoItemToYouTubeVideo(item: VideoItem): YouTubeVideo {
  const videoIdMatch = item.embedUrl.match(/\/embed\/([^/?]+)/);
  const videoId =
    videoIdMatch?.[1] ??
    (item.id.startsWith("c-") ? item.id : item.id.replace(/^c-/, ""));

  return {
    videoId,
    title: item.title,
    description: item.description,
    publishedAt: item.publishedAt,
    thumbnail: item.thumbnail ?? "/images/football-hero-bg.jpg",
    channelTitle: item.source,
    url: item.url,
  };
}

export function youTubeVideoToVideoItem(video: YouTubeVideo): VideoItem {
  const embedUrl = video.videoId.startsWith("wc26-fallback")
    ? video.url
    : `https://www.youtube.com/embed/${video.videoId}`;

  return {
    id: `c-${video.videoId}`,
    title: video.title,
    description: video.description,
    url: video.url,
    thumbnail: video.thumbnail,
    publishedAt: video.publishedAt,
    source: video.channelTitle,
    kind: "video",
    embedUrl,
  };
}

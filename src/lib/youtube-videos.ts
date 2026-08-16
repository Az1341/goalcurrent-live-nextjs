import type { VideosApiResponse, YouTubeVideo } from "@/types/video";
import { filterRelevantFootballVideos } from "@/lib/video-relevance";

export type VideoFeedCategory = "pl" | "wc" | "all";

const YT_BASE = "https://www.googleapis.com/youtube/v3";
const FIFA_CHANNEL = "UCpcTrCXblq78GZrTUTLWeBw";

const DEFAULT_SEARCH_QUERY = "FIFA World Cup 2026 match preview";
const FALLBACK_SEARCH_QUERY = "FIFA World Cup 2026 football preview";

const CATEGORY_QUERIES: Record<Exclude<VideoFeedCategory, "all">, string> = {
  pl: "Premier League 2026 football highlights",
  wc: "FIFA World Cup 2026 football highlights",
};

type YouTubeSearchItem = {
  id?: { videoId?: string } | string;
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    channelTitle?: string;
    thumbnails?: {
      maxres?: { url?: string };
      high?: { url?: string };
      medium?: { url?: string };
    };
  };
};

function emptyResponse(error?: string): VideosApiResponse {
  return {
    videos: [],
    count: 0,
    fetchedAt: new Date().toISOString(),
    ...(error ? { error } : {}),
  };
}

function formatItems(items: YouTubeSearchItem[]): YouTubeVideo[] {
  return items
    .filter((item) => {
      const id = item.id;
      return id && (typeof id === "object" ? id.videoId : typeof id === "string");
    })
    .map((item) => {
      const videoId =
        typeof item.id === "object" ? (item.id?.videoId ?? "") : String(item.id);
      const snippet = item.snippet ?? {};
      const thumbs = snippet.thumbnails ?? {};
      const thumbnail =
        thumbs.maxres?.url ??
        thumbs.high?.url ??
        thumbs.medium?.url ??
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      return {
        videoId,
        title: snippet.title ?? "",
        description: snippet.description ?? "",
        publishedAt: snippet.publishedAt ?? "",
        thumbnail,
        channelTitle: snippet.channelTitle ?? "YouTube",
        url: `https://www.youtube.com/watch?v=${videoId}`,
      };
    })
    .filter((video) => video.videoId && video.title);
}

async function ytFetch(path: string, apiKey: string): Promise<unknown> {
  const url = `${YT_BASE}${path}`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[YouTube] HTTP error:", response.status, body.slice(0, 500));
    throw new Error(`YouTube API ${response.status}: ${body.slice(0, 200)}`);
  }

  return response.json();
}

async function searchVideos(
  apiKey: string,
  query: string,
  maxResults: number,
  channelId?: string,
): Promise<YouTubeVideo[]> {
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    order: "date",
    maxResults: String(maxResults),
    key: apiKey,
  });

  if (channelId) {
    params.set("channelId", channelId);
  }

  const data = (await ytFetch(`/search?${params.toString()}`, apiKey)) as {
    items?: YouTubeSearchItem[];
  };

  return formatItems(data.items ?? []);
}

async function fetchDefaultVideos(
  apiKey: string,
  maxResults: number,
): Promise<YouTubeVideo[]> {
  const channelResults = filterRelevantFootballVideos(
    await searchVideos(
      apiKey,
      DEFAULT_SEARCH_QUERY,
      Math.max(maxResults * 2, 8),
      FIFA_CHANNEL,
    ),
    "all",
  );

  if (channelResults.length > 0) {
    return channelResults.slice(0, maxResults);
  }

  return filterRelevantFootballVideos(
    await searchVideos(apiKey, FALLBACK_SEARCH_QUERY, Math.max(maxResults * 2, 8)),
    "all",
  ).slice(0, maxResults);
}

async function fetchCategoryVideos(
  apiKey: string,
  category: Exclude<VideoFeedCategory, "all">,
  maxResults: number,
): Promise<YouTubeVideo[]> {
  // World Cup is ambiguous across sports. Prefer FIFA's official channel first,
  // then use a guarded broad search only if it cannot fill the requested feed.
  if (category === "wc") {
    const official = filterRelevantFootballVideos(
      await searchVideos(
        apiKey,
        CATEGORY_QUERIES.wc,
        Math.max(maxResults * 2, 12),
        FIFA_CHANNEL,
      ),
      "wc",
    );

    if (official.length >= maxResults) {
      return official.slice(0, maxResults);
    }

    const broad = filterRelevantFootballVideos(
      await searchVideos(
        apiKey,
        CATEGORY_QUERIES.wc,
        Math.max(maxResults * 3, 18),
      ),
      "wc",
    );

    const combined = new Map<string, YouTubeVideo>();
    for (const video of [...official, ...broad]) {
      combined.set(video.videoId, video);
    }
    return [...combined.values()].slice(0, maxResults);
  }

  return filterRelevantFootballVideos(
    await searchVideos(
      apiKey,
      CATEGORY_QUERIES[category],
      Math.max(maxResults * 2, 12),
    ),
    category,
  ).slice(0, maxResults);
}

export function parseVideoFeedCategory(
  raw: string | null | undefined,
): VideoFeedCategory {
  if (raw === "pl" || raw === "premier-league") {
    return "pl";
  }
  if (raw === "wc" || raw === "world-cup") {
    return "wc";
  }
  if (raw === "all") {
    return "all";
  }
  return "all";
}

/**
 * Search-list calls consume significant YouTube quota and had begun returning
 * 429s in production. Live search is therefore opt-in; safe curated football
 * fallbacks remain available when this flag is off.
 */
export function isYouTubeLiveSearchEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.YOUTUBE_LIVE_SEARCH_ENABLED?.trim().toLowerCase() === "true";
}

export async function fetchYouTubeVideos(
  category: VideoFeedCategory = "all",
  maxResults = category === "all" ? 4 : 12,
): Promise<VideosApiResponse> {
  if (!isYouTubeLiveSearchEnabled()) {
    return emptyResponse("Live YouTube search disabled");
  }

  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  if (!apiKey) {
    return emptyResponse("YOUTUBE_API_KEY not configured");
  }

  try {
    const videos =
      category === "all"
        ? await fetchDefaultVideos(apiKey, maxResults)
        : await fetchCategoryVideos(apiKey, category, maxResults);

    return {
      videos,
      count: videos.length,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[YouTube] fetchYouTubeVideos failed:", error);
    return emptyResponse("Failed to fetch videos");
  }
}

import type { YouTubeVideo } from "@/types/video";
import type { VideoFeedCategory } from "@/lib/youtube-videos";

const OTHER_SPORTS = /\b(cricket|t20|icc|wicket|innings|basketball|nba|nfl|american football|rugby|tennis|golf|formula\s*1|f1)\b/i;
const WORLD_CUP_FOOTBALL = /\b(fifa|football|soccer|world cup 2026|2026 world cup)\b/i;
const PREMIER_LEAGUE_FOOTBALL = /\b(premier league|football|soccer)\b/i;

function searchableText(video: YouTubeVideo): string {
  return `${video.title} ${video.description} ${video.channelTitle}`;
}

/**
 * Keep indexable video feeds football-only. YouTube search can return other
 * sports for ambiguous terms such as "World Cup"; those results must never be
 * exposed as GoalCurrent editorial recommendations.
 */
export function isRelevantFootballVideo(
  video: YouTubeVideo,
  category: VideoFeedCategory,
): boolean {
  const text = searchableText(video);

  if (OTHER_SPORTS.test(text)) {
    return false;
  }

  if (category === "wc") {
    return WORLD_CUP_FOOTBALL.test(text);
  }

  if (category === "pl") {
    return PREMIER_LEAGUE_FOOTBALL.test(text);
  }

  return /\b(fifa|football|soccer|premier league|world cup)\b/i.test(text);
}

export function filterRelevantFootballVideos(
  videos: readonly YouTubeVideo[],
  category: VideoFeedCategory,
): YouTubeVideo[] {
  return videos.filter((video) => isRelevantFootballVideo(video, category));
}

"use client";

import { useMemo } from "react";
import Image from "next/image";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fetcher } from "@/lib/client/fetcher";
import { shouldUseUnoptimizedImage } from "@/lib/images";
import type { VideosApiResponse, YouTubeVideo } from "@/types/video";
import styles from "../home-v5.module.css";

const WC26_VIDEO_TERMS = [
  "world cup 2026",
  "2026 world cup",
  "fifa world cup 2026",
  "2026 fifa world cup",
  "wc26",
] as const;

function isWc26Video(video: YouTubeVideo): boolean {
  const haystack = `${video.title} ${video.description}`.toLowerCase();
  return WC26_VIDEO_TERMS.some((term) => haystack.includes(term));
}

function dedupeVideos(videos: readonly YouTubeVideo[]): YouTubeVideo[] {
  const seen = new Set<string>();
  const unique: YouTubeVideo[] = [];
  for (const video of videos) {
    if (isWc26Video(video)) continue;
    const key = video.videoId || video.url;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(video);
    if (unique.length >= 8) break;
  }
  return unique;
}

export default function HomeTrendingClips() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const { data, isLoading } = useSWR<VideosApiResponse>(
    "/api/videos?limit=8",
    fetcher,
  );

  const videos = useMemo(
    () => dedupeVideos(data?.videos ?? []),
    [data?.videos],
  );

  if (isLoading && !videos.length) {
    return (
      <section className={styles.section} aria-labelledby="home-clips-heading">
        <h2 id="home-clips-heading" className={styles.sectionTitle}>
          {tNav("latestVideos")}
        </h2>
        <div className={`${styles.skeleton} animate-skeleton-shimmer`} />
      </section>
    );
  }

  if (!videos.length) return null;

  return (
    <section className={styles.section} aria-labelledby="home-clips-heading">
      <div className={styles.sectionHeader}>
        <h2 id="home-clips-heading" className={styles.sectionTitle}>
          {tNav("latestVideos")}
        </h2>
        <Link href="/videos" className={styles.sectionLink}>
          {tCommon("viewAll")} →
        </Link>
      </div>
      <div className={styles.clipsScroll}>
        {videos.map((video) => (
          <a
            key={video.videoId}
            href={video.url}
            className={styles.clipCard}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.clipThumb}>
              <Image
                src={video.thumbnail}
                alt=""
                fill
                sizes="160px"
                unoptimized={shouldUseUnoptimizedImage(video.thumbnail)}
                className={styles.clipThumbImage}
              />
              <span className={styles.clipPlay} aria-hidden="true">▶</span>
            </div>
            <p className={styles.clipTitle}>{video.title}</p>
            <p className={styles.clipViews}>{video.channelTitle}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

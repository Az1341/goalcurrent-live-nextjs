"use client";

import Link from "next/link";
import { useMemo } from "react";
import NewsCard, { FeaturedArticle } from "@/components/news/NewsCard";
import type { NewsApiResponse, NewsArticle } from "@/types/news";
import { sortPartnerNewsFeed } from "@/lib/editorial-news";
import { EDITORIAL_SOURCE_LABEL } from "@/lib/seo/constants";
import { useNewsFeed } from "@/lib/use-news-feed";
import styles from "./news.module.css";

function LoadingSkeleton() {
  return (
    <div className={styles.skeletonGrid} aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={styles.skeleton}>
          <div className={`${styles.skLine} ${styles.skLineLong}`} />
          <div className={`${styles.skLine} ${styles.skLineMedium}`} />
          <div className={`${styles.skLine} ${styles.skLineShort}`} />
        </div>
      ))}
    </div>
  );
}

type NewsHubProps = {
  initialData?: NewsApiResponse;
};

export default function NewsHub({ initialData }: NewsHubProps) {
  const { data, loading, error, sources } = useNewsFeed({
    fallbackData: initialData,
  });

  const updatedLabel = useMemo(() => {
    const payload = data?.articles.length ? data : initialData;
    if (!payload?.articles.length) {
      return "Loading…";
    }
    return `Updated: ${new Date(payload.fetched).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })} · ${payload.sources.join(" + ") || "BBC Sport + ESPN"}`;
  }, [data, initialData]);

  const articles = useMemo(() => {
    const rssArticles: NewsArticle[] = data?.articles ?? [];
    return sortPartnerNewsFeed(rssArticles);
  }, [data]);

  const showSkeleton = loading && articles.length === 0;
  const showError = error && articles.length === 0;
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <main className={styles.content}>
      <h1 className={styles.pageTitle}>
        Latest <span>Football News</span>
      </h1>
      <p className={styles.pageIntro}>
        World Cup 2026 and football headlines from BBC Sport, ESPN, and partner
        feeds — refreshed daily from our content cache.
      </p>

      <div className={styles.sourceBar}>
        <span className={`${styles.sourceTag} ${styles.sourceTagBbc}`}>
          BBC Sport
        </span>
        <span className={`${styles.sourceTag} ${styles.sourceTagEspn}`}>
          ESPN
        </span>
        <span className={styles.sourceTag}>Daily content cache</span>
        <span className={styles.sourceUpdated}>{updatedLabel}</span>
      </div>

      <Link href="/articles" style={{
        display: "block",
        background: "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(16,185,129,0.06) 100%)",
        border: "1px solid rgba(37,99,235,0.18)",
        borderRadius: 12,
        padding: "14px 18px",
        marginBottom: 20,
        textDecoration: "none",
        color: "inherit",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
              ✍️ {EDITORIAL_SOURCE_LABEL}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              Original articles, analysis & World Cup 2026 guides
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
              Exclusive articles — World Cup groups, Premier League review, UCL Final & more
            </div>
          </div>
          <div style={{ fontSize: 20, flexShrink: 0 }}>→</div>
        </div>
      </Link>

      {showSkeleton ? <LoadingSkeleton /> : null}

      {showError ? (
        <p className="text-center text-gray-400 py-4">
          Unable to load data. Please try again shortly.
        </p>
      ) : null}

      {!showSkeleton && !showError && featured ? (
        <FeaturedArticle article={featured} />
      ) : null}

      {!showSkeleton && !showError ? (
        <>
          <div className={styles.sectionLabel}>Latest World Cup 2026 News</div>
          <div className={styles.grid}>
            {rest.map((article: NewsArticle) => (
              <NewsCard
                key={`${article.link}-${article.title}`}
                article={article}
              />
            ))}
          </div>
          {sources.length > 0 ? (
            <p className={styles.fallbackNote}>
              Sources: {sources.join(", ")}
            </p>
          ) : null}
        </>
      ) : null}

      <p className={styles.hubBack}>
        <Link href="/">← Back to Home</Link>
      </p>
    </main>
  );
}

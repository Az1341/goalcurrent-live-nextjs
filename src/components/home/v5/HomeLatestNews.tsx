"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { formatNewsRelativeTime } from "@/lib/news-format";
import { mergeHomepageNewsFeed } from "@/lib/editorial-news";
import { shouldUseUnoptimizedImage, withSvgMediaClass } from "@/lib/images";
import { useNewsFeed } from "@/lib/use-news-feed";
import type { NewsArticle } from "@/types/news";
import styles from "../home-v5.module.css";

function isExternalLink(link: string): boolean {
  return link.startsWith("http://") || link.startsWith("https://");
}

function NewsLink({
  article,
  className,
  children,
}: {
  article: NewsArticle;
  className: string;
  children: React.ReactNode;
}) {
  if (isExternalLink(article.link)) {
    return (
      <a
        href={article.link}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={article.link} className={className}>
      {children}
    </Link>
  );
}

export default function HomeLatestNews() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const { articles, loading } = useNewsFeed();
  const [featured, ...rest] = useMemo(() => {
    const merged = mergeHomepageNewsFeed(articles);
    return merged.slice(0, 4);
  }, [articles]);

  if (loading && !featured) {
    return (
      <section className={styles.section} aria-labelledby="home-news-heading">
          <h2 id="home-news-heading" className={styles.sectionTitle}>
            {tNav("latestNews")}
          </h2>
        <div className={`${styles.skeleton} animate-skeleton-shimmer`} />
      </section>
    );
  }

  if (!featured) {
    return null;
  }

  return (
    <section className={styles.section} aria-labelledby="home-news-heading">
      <div className={styles.sectionHeader}>
        <h2 id="home-news-heading" className={styles.sectionTitle}>
          {tNav("latestNews")}
        </h2>
        <Link href="/news" className={styles.sectionLink}>
          {tCommon("viewAll")} →
        </Link>
      </div>
      <div className={styles.newsLayout}>
        <NewsLink article={featured} className={styles.newsFeatured}>
          {featured.image ? (
            <div
              className={withSvgMediaClass(
                featured.image,
                styles.newsFeaturedImage,
                styles.newsFeaturedImageSvg,
              )}
            >
              <Image
                src={featured.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized={shouldUseUnoptimizedImage(featured.image)}
                className={styles.newsFeaturedImg}
              />
            </div>
          ) : (
            <div className={styles.newsFeaturedImage} aria-hidden="true" />
          )}
          <div className={styles.newsFeaturedBody}>
            <span className={styles.newsTag}>{featured.tag}</span>
            <h3 className={styles.newsHeadline}>{featured.title}</h3>
            {featured.date ? (
              <p className={styles.newsMeta}>
                <time dateTime={featured.date}>
                  {formatNewsRelativeTime(featured.date)}
                </time>
              </p>
            ) : null}
          </div>
        </NewsLink>

        <div className={styles.newsSecondaryList}>
          {rest.map((article) => (
            <NewsLink
              key={`${article.link}-${article.title}`}
              article={article}
              className={styles.newsSecondaryRow}
            >
              {article.image ? (
                <div
                  className={withSvgMediaClass(
                    article.image,
                    styles.newsThumb,
                    styles.newsThumbSvg,
                  )}
                >
                  <Image
                    src={article.image}
                    alt=""
                    fill
                    sizes="80px"
                    unoptimized={shouldUseUnoptimizedImage(article.image)}
                    className={styles.newsThumbImg}
                  />
                </div>
              ) : (
                <div className={styles.newsThumb} aria-hidden="true" />
              )}
              <div className={styles.newsSecondaryBody}>
                <span className={styles.newsTag}>{article.tag}</span>
                <p className={styles.newsSecondaryHeadline}>{article.title}</p>
                {article.date ? (
                  <p className={styles.newsMeta}>
                    <time dateTime={article.date}>
                      {formatNewsRelativeTime(article.date)}
                    </time>
                  </p>
                ) : null}
              </div>
            </NewsLink>
          ))}
        </div>
      </div>
    </section>
  );
}

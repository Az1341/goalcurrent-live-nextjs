export const dynamic = "force-dynamic";
export const revalidate = 300;

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import ArticleCard from "@/components/articles/ArticleCard";
import ArticleAuthorLine, {
  ArticleCopyrightNotice,
} from "@/components/articles/ArticleAuthorLine";
import JsonLd from "@/components/seo/JsonLd";
import { fetchSyndicatedArticles } from "@/content/readers";
import {
  ARTICLE_INDEX,
  ARTICLES,
  EXTERNAL_ARTICLE_CARDS,
  articleHref,
} from "@/data/articles";
import {
  getArticleCardImage,
  isArticleCardImageUnoptimized,
} from "@/lib/article-hub";
import { localizedUrl } from "@/lib/i18n/urls";
import { withSvgMediaClass } from "@/lib/images";
import { buildPageMetadata } from "@/lib/page-metadata";
import { toIsoDate } from "@/lib/seo/dates";
import { EDITORIAL_AUTHOR, EDITORIAL_PUBLISHER } from "@/lib/seo/constants";
import styles from "./article.module.css";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Football Articles & Analysis",
    description: `In-depth football articles, World Cup 2026 match recaps, and expert analysis by ${EDITORIAL_AUTHOR} on ${EDITORIAL_PUBLISHER}.`,
    path: "/articles",
    locale,
  });
}

const CATEGORY_LABELS: Record<string, string> = {
  "world-cup-2026": "🌍 World Cup 2026",
  "premier-league": "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League",
  "champions-league": "⭐ Champions League",
  editorial: "✍️ Editorial",
};

export default async function ArticlesIndexPage() {
  const locale = await getLocale();
  let syndicatedArticles: Awaited<ReturnType<typeof fetchSyndicatedArticles>> =
    [];

  try {
    syndicatedArticles = await fetchSyndicatedArticles();
    if (process.env.NODE_ENV === "development") {
      console.log("[articles] syndicated response:", {
        count: syndicatedArticles.length,
        sample: syndicatedArticles.slice(0, 2),
      });
    }
  } catch {
    return (
      <main className={styles.articlePage}>
        <p className="text-center text-gray-400 py-4">
          Unable to load data. Please try again shortly.
        </p>
      </main>
    );
  }

  const sortedIndex = [...ARTICLE_INDEX].sort((a, b) =>
    toIsoDate(b.date).localeCompare(toIsoDate(a.date)),
  );
  const sortedArticles = [...ARTICLES].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const indexSlugs = new Set(sortedIndex.map((a) => a.slug));
  const orphanArticles = sortedArticles.filter((a) => !indexSlugs.has(a.slug));

  if (
    !sortedIndex.length &&
    !sortedArticles.length &&
    !syndicatedArticles.length
  ) {
    return (
      <main className={styles.articlePage}>
        <p className="text-center text-gray-400 py-4">
          Unable to load data. Please try again shortly.
        </p>
      </main>
    );
  }

  const collectionItems = [
    ...sortedIndex.map((a) => ({
      name: a.title,
      path: a.href ?? articleHref(a.slug),
    })),
    ...orphanArticles.map((a) => ({
      name: a.title,
      path: articleHref(a.slug),
    })),
  ];

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Football Articles & Analysis",
    description: `In-depth football articles, World Cup 2026 match recaps, and expert analysis by ${EDITORIAL_AUTHOR} on ${EDITORIAL_PUBLISHER}.`,
    url: localizedUrl("/articles", locale),
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: EDITORIAL_PUBLISHER,
      url: localizedUrl("/", locale),
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: collectionItems.length,
      itemListElement: collectionItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: localizedUrl(item.path, locale),
      })),
    },
  };

  return (
    <main className={styles.articlePage}>
      <JsonLd data={collectionSchema} />
      <div className={styles.stack}>
        <div className={styles.heroCard}>
          <div className={styles.categoryPill}>{EDITORIAL_PUBLISHER}</div>
          <h1>Football Articles &amp; Analysis</h1>
          <div className={styles.hereMeta}>
            <ArticleAuthorLine sepClassName={styles.sep} />
            <span className={styles.sep}>·</span>
            <span>Expert football writing &amp; analysis</span>
          </div>
        </div>

        <div className={styles.articlesGrid}>
          {syndicatedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {sortedIndex.map((a) => {
            const image = getArticleCardImage(a.slug);
            return (
              <Link
                key={a.slug}
                href={a.href ?? articleHref(a.slug)}
                className={styles.articleIndexCard}
              >
                <div
                  className={withSvgMediaClass(
                    image,
                    styles.articleIndexImageWrap,
                    styles.articleIndexImageWrapSvg,
                  )}
                >
                  <Image
                    src={image}
                    alt=""
                    width={640}
                    height={360}
                    sizes="(max-width: 768px) 100vw, 400px"
                    className={withSvgMediaClass(
                      image,
                      styles.articleIndexImage,
                      styles.articleIndexImageSvg,
                    )}
                    unoptimized={isArticleCardImageUnoptimized(image)}
                  />
                </div>
                <span className={styles.pill}>{a.category}</span>
                <h2>{a.title}</h2>
                <p>{a.excerpt}</p>
                <span className={styles.readMore}>Read article →</span>
              </Link>
            );
          })}
          {EXTERNAL_ARTICLE_CARDS.map((article) => (
            <a
              key={article.href}
              href={article.href}
              className={styles.articleIndexCard}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.articleIndexImageWrap}>
                <Image
                  src={article.image}
                  alt=""
                  width={640}
                  height={280}
                  sizes="(max-width: 768px) 100vw, 400px"
                  className={styles.articleIndexImage}
                />
              </div>
              <span className={styles.pill}>{article.source}</span>
              <h2>{article.title}</h2>
              <p>{article.excerpt}</p>
              <span className={styles.readMore}>Read on MSN ↗</span>
            </a>
          ))}
          {orphanArticles.map((a) => (
            <Link
              key={a.slug}
              href={articleHref(a.slug)}
              className={styles.articleIndexCard}
            >
              <span className={styles.pill}>
                {CATEGORY_LABELS[a.category] ?? a.category}
              </span>
              <h2>{a.title}</h2>
              <p>{a.description}</p>
              <span className={styles.readMore}>Read article →</span>
            </Link>
          ))}
        </div>

        <div className={styles.copyrightCard}>
          <p>
            <strong>© 2026 GoalCurrent.live — All Rights Reserved.</strong>
            <br />
            <ArticleCopyrightNotice />
            <br />
            For syndication enquiries contact us at{" "}
            <a href="https://goalcurrent.live/contact">
              goalcurrent.live/contact
            </a>
          </p>
        </div>

        <div className={styles.btnRow}>
          <Link href="/" className={styles.btnSecondary}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

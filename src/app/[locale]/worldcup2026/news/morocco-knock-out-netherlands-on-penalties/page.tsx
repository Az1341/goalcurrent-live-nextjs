import type { Metadata } from "next";
import ArticleBanner from "@/components/articles/ArticleBanner";
import Link from "next/link";
import ArticleAuthorLine, {
  ArticleCopyrightNotice,
} from "@/components/articles/ArticleAuthorLine";
import ArticleSeo from "@/components/seo/ArticleSeo";
import { buildArticleMetadata } from "@/lib/page-metadata";
import { absoluteUrl } from "@/lib/site-url";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumbs";
import MoroccoNetherlandsArticleBody from "./MoroccoNetherlandsArticleBody";
import styles from "@/app/[locale]/articles/article.module.css";

const ARTICLE_PATH = "/worldcup2026/news/morocco-knock-out-netherlands-on-penalties";
const IMG = "/images/news/morocco-knock-out-netherlands-on-penalties";
const HERO_IMAGE = `${IMG}/hero.svg`;
const READ_TIME_MINUTES = 4;

const HEADLINE =
  "Morocco Knock Out the Netherlands on Penalties After Dramatic World Cup Thriller";

const SEO_TITLE =
  "Morocco Beat Netherlands on Penalties | FIFA World Cup 2026 Round of 32";

const META_DESCRIPTION =
  "Morocco defeated the Netherlands on penalties after a dramatic 1-1 draw in the FIFA World Cup 2026 Round of 32. Read the full match report, analysis and reaction.";

const ARTICLE_KEYWORDS = [
  "Morocco",
  "Netherlands",
  "World Cup 2026",
  "Round of 32",
  "penalty shootout",
  "match report",
  "FIFA World Cup",
  "knockout stage",
];

const breadcrumbs: BreadcrumbItem[] = [
  { name: "World Cup 2026", path: "/worldcup2026" },
  { name: "News", path: "/news/world-cup" },
  { name: HEADLINE, path: ARTICLE_PATH },
];

const seoArticle = {
  path: ARTICLE_PATH,
  headline: HEADLINE,
  description: META_DESCRIPTION,
  datePublished: "30 June 2026",
  dateModified: "30 June 2026",
  image: absoluteUrl(HERO_IMAGE),
};

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildArticleMetadata({
    title: SEO_TITLE,
    description: META_DESCRIPTION,
    path: ARTICLE_PATH,
    keywords: ARTICLE_KEYWORDS,
    publishedTime: "2026-06-30",
    modifiedTime: "2026-06-30",
    ogImage: absoluteUrl(HERO_IMAGE),
    locale,
  });
}

export default function MoroccoNetherlandsPenaltiesArticlePage() {
  return (
    <>
      <ArticleSeo article={seoArticle} breadcrumbs={breadcrumbs} />
      <main className={styles.articlePage}>
        <div className={styles.stack}>
          <ArticleBanner
            src={HERO_IMAGE}
            alt="Original GoalCurrent.live graphic for Morocco beating the Netherlands on penalties at World Cup 2026"
          />

          <div className={styles.heroCard}>
            <div className={styles.categoryPill}>Match Report · World Cup 2026</div>
            <h1>{HEADLINE}</h1>
            <div className={styles.tagRow} aria-label="Article tags">
              {ARTICLE_KEYWORDS.slice(0, 5).map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
            <div className={styles.hereMeta}>
              <ArticleAuthorLine sepClassName={styles.sep} />
              <span className={styles.sep}>·</span>
              <span>30 June 2026</span>
              <span className={styles.sep}>·</span>
              <span className={styles.readTime}>{READ_TIME_MINUTES} min read</span>
            </div>
          </div>

          <MoroccoNetherlandsArticleBody />

          <div className={styles.copyrightCard}>
            <p>
              <strong>© 2026 GoalCurrent.live — All Rights Reserved.</strong>
              <br />
              <ArticleCopyrightNotice />
              <br />
              Hero image: original GoalCurrent.live editorial graphic. See{" "}
              <code>{IMG}/article-image-credits.md</code> for attribution.
              <br />
              For syndication enquiries visit{" "}
              <a
                href="https://goalcurrent.live/contact"
                target="_blank"
                rel="noopener noreferrer"
              >
                goalcurrent.live/contact
              </a>
            </p>
          </div>

          <div className={styles.btnRow}>
            <Link href="/news/world-cup" className={styles.btnSecondary}>
              ← World Cup News
            </Link>
            <Link href="/worldcup2026" className={styles.btnSecondary}>
              World Cup Hub
            </Link>
            <Link href="/match/fixture-076" className={styles.btnSecondary}>
              Match centre
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

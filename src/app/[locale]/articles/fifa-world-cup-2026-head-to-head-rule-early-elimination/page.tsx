import type { Metadata } from "next";
import ArticleBanner from "@/components/articles/ArticleBanner";
import ArticleAuthorLine, {
  ArticleCopyrightNotice,
} from "@/components/articles/ArticleAuthorLine";
import ArticleSeo from "@/components/seo/ArticleSeo";
import { articleBreadcrumbs } from "@/lib/seo/article-seo";
import { buildArticleMetadata } from "@/lib/page-metadata";
import { absoluteUrl } from "@/lib/site-url";
import { articleHref } from "@/data/articles";
import FifaH2hArticleBody from "./FifaH2hArticleBody";
import styles from "../article.module.css";

const SLUG = "fifa-world-cup-2026-head-to-head-rule-early-elimination";
const IMG = "/images/news/fifa-world-cup-2026-head-to-head-rule-early-elimination";
const HERO_IMAGE = `${IMG}/hero.svg`;
const READ_TIME_MINUTES = 8;

const HEADLINE =
  "FIFA's Head-to-Head Rule Has Changed the World Cup Group Stage - But Not in the Way Some Headlines Suggest";

const SEO_TITLE = "FIFA Head-to-Head Rule Explained | World Cup 2026 Analysis";
const META_DESCRIPTION =
  "FIFA Article 13 ranks head-to-head before goal difference at World Cup 2026. What changed, what headlines get wrong, and how groups can end early.";

const ARTICLE_KEYWORDS = [
  "FIFA",
  "World Cup 2026",
  "Group Stage",
  "Head-to-Head",
  "FIFA Rules",
  "Football Rules",
  "Knockout Stage",
  "Tournament Format",
  "Football Analysis",
];

const seoArticle = {
  path: articleHref(SLUG),
  headline: HEADLINE,
  description: META_DESCRIPTION,
  datePublished: "25 June 2026",
  dateModified: "25 June 2026",
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
    path: articleHref(SLUG),
    keywords: ARTICLE_KEYWORDS,
    publishedTime: "2026-06-25",
    modifiedTime: "2026-06-25",
    ogImage: absoluteUrl(HERO_IMAGE),
    locale,
  });
}

export default function FifaHeadToHeadRuleArticlePage() {
  return (
    <>
      <ArticleSeo
        article={seoArticle}
        breadcrumbs={articleBreadcrumbs(SLUG, HEADLINE)}
      />
      <main className={styles.articlePage}>
        <div className={styles.stack}>
          <ArticleBanner
            src={HERO_IMAGE}
            alt="Original GoalCurrent.live graphic explaining FIFA Article 13 head-to-head tiebreakers at World Cup 2026"
          />

          <div className={styles.heroCard}>
            <div className={styles.categoryPill}>Analysis | World Cup 2026</div>
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
              <span className={styles.sep}>|</span>
              <span>25 June 2026</span>
              <span className={styles.sep}>|</span>
              <span className={styles.readTime}>{READ_TIME_MINUTES} min read</span>
            </div>
          </div>

          <FifaH2hArticleBody />

          <div className={styles.copyrightCard}>
            <p>
              <strong>Copyright 2026 GoalCurrent.live - All Rights Reserved.</strong>
              <br />
              <ArticleCopyrightNotice />
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
        </div>
      </main>
    </>
  );
}
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ArticleSeo from "@/components/seo/ArticleSeo";
import RelatedInternalLinks from "@/components/seo/RelatedInternalLinks";
import ArticleBodyWithAd from "@/components/articles/ArticleBodyWithAd";
import ArticleViewTracker from "@/components/analytics/ArticleViewTracker";
import { getArticleBySlug, getDynamicArticleSlugs } from "@/data/articles";
import {
  articleBreadcrumbs,
  articleSeoFromArticle,
  buildStaticArticleMetadata,
} from "@/lib/seo/article-seo";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { EDITORIAL_SOURCE_LABEL } from "@/lib/seo/constants";
import { absoluteUrl } from "@/lib/site-url";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getDynamicArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };
  return buildStaticArticleMetadata(slug);
}

const CATEGORY_LABELS: Record<string, string> = {
  "world-cup-2026": "🌍 World Cup 2026",
  "premier-league": "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League",
  "champions-league": "⭐ Champions League",
  editorial: `✍️ ${EDITORIAL_SOURCE_LABEL}`,
};

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const seo = articleSeoFromArticle(article);

  return (
    <>
      <ArticleViewTracker
        articleId={slug}
        slug={slug}
        category={article.category}
        author={EDITORIAL_SOURCE_LABEL}
      />
      <ArticleSeo
        article={seo}
        breadcrumbs={articleBreadcrumbs(slug, article.title)}
      />
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 120px" }}>
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, #f8fafc 100%)",
            border: "1px solid rgba(37,99,235,0.1)",
            borderRadius: 16,
            padding: "24px 20px",
            marginBottom: 28,
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <span
              style={{
                background: "rgba(37,99,235,0.1)",
                color: "#2563eb",
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 20,
                letterSpacing: "0.05em",
              }}
            >
              {CATEGORY_LABELS[article.category] || article.category}
            </span>
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.25,
              marginBottom: 12,
            }}
          >
            {article.title}
          </h1>
          <div
            style={{
              display: "flex",
              gap: 14,
              fontSize: 12,
              color: "#94a3b8",
              flexWrap: "wrap",
            }}
          >
            <time dateTime={seo.datePublished}>📅 {article.date}</time>
            <span>✍️ {EDITORIAL_SOURCE_LABEL}</span>
            <span>⏱ {article.readTime} min read</span>
          </div>
        </div>

        <ArticleBodyWithAd html={article.content} />

        <ShareButtons
          url={absoluteUrl(`/articles/${article.slug}`)}
          title={article.title}
        />

        <RelatedInternalLinks
          links={[
            { href: "/articles", label: "All articles" },
            { href: "/worldcup2026", label: "World Cup 2026 hub" },
            { href: "/premier-league", label: "Premier League hub" },
            { href: "/live", label: "Live scores" },
          ]}
        />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
          <Link
            href="/articles"
            style={{
              padding: "8px 16px",
              background: "rgba(37,99,235,0.1)",
              color: "#2563eb",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            ← All Articles
          </Link>
        </div>
      </main>
    </>
  );
}

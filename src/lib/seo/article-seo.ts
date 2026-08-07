import {
  ARTICLE_INDEX,
  articleHref,
  getArticleBySlug,
  type Article,
} from "@/data/articles";
import { getEditorialArticleByPath } from "@/data/editorial";
import type { ArticleSchemaInput } from "@/lib/seo/schema";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumbs";
import type { Metadata } from "next";
import { buildArticleMetadata } from "@/lib/page-metadata";
import { EDITORIAL_AUTHOR } from "@/lib/seo/constants";
import { resolveArticleShareImageUrl } from "@/lib/seo/article-og-image";

/** Dedicated card art when present; otherwise branded generated OG image. */
function articleSchemaImage(slug: string): string {
  return resolveArticleShareImageUrl(slug);
}

export function articleSeoFromArticle(article: Article): ArticleSchemaInput {
  return {
    path: articleHref(article.slug),
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    author: EDITORIAL_AUTHOR,
    image: articleSchemaImage(article.slug),
  };
}

export function articleSeoFromSlug(slug: string): ArticleSchemaInput | null {
  const dynamic = getArticleBySlug(slug);
  if (dynamic) {
    return articleSeoFromArticle(dynamic);
  }

  const indexEntry = ARTICLE_INDEX.find((entry) => entry.slug === slug);
  if (indexEntry) {
    return {
      path: articleHref(slug),
      headline: indexEntry.title,
      description: indexEntry.excerpt,
      datePublished: indexEntry.date,
      dateModified: indexEntry.date,
      author: indexEntry.author ?? EDITORIAL_AUTHOR,
      image: articleSchemaImage(slug),
    };
  }

  const editorial = getEditorialArticleByPath(articleHref(slug));
  if (editorial) {
    return {
      path: editorial.path,
      headline: editorial.title,
      description: editorial.description,
      datePublished: editorial.publishedAt,
      dateModified: editorial.publishedAt,
      author: editorial.author,
      image: articleSchemaImage(editorial.slug),
    };
  }

  return null;
}

export function buildStaticArticleMetadata(slug: string): Metadata {
  const seo = articleSeoFromSlug(slug);
  const ogImage = resolveArticleShareImageUrl(slug);
  if (!seo) {
    return buildArticleMetadata({
      title: "Article",
      description: "Football article on GoalCurrent.live",
      path: articleHref(slug),
      ogImage,
    });
  }

  return buildArticleMetadata({
    title: seo.headline,
    description: seo.description,
    path: seo.path,
    publishedTime: seo.datePublished,
    modifiedTime: seo.dateModified,
    authors: seo.author ? [seo.author] : undefined,
    ogImage,
  });
}

export function articleBreadcrumbs(slug: string, title: string): BreadcrumbItem[] {
  return [
    { name: "Articles", path: "/articles" },
    { name: title, path: articleHref(slug) },
  ];
}

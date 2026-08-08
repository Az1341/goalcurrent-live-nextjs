import type { Metadata } from "next";
import EditorialArticleView from "@/components/news/EditorialArticleView";
import ArticleSeo from "@/components/seo/ArticleSeo";
import { BEIRANVAND_FEATURE } from "@/data/editorial/beiranvand-feature";
import {
  articleBreadcrumbs,
  articleSeoFromSlug,
} from "@/lib/seo/article-seo";
import { buildArticleMetadata } from "@/lib/page-metadata";

const article = BEIRANVAND_FEATURE;
const seo = articleSeoFromSlug("alireza-beiranvand-iran-world-cup-hero")!;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildArticleMetadata({
    title: article.title,
    description: article.description,
    path: article.path,
    keywords: article.keywords,
    publishedTime: article.publishedAt,
    modifiedTime: article.publishedAt,
    authors: [article.author],
    locale,
  });
}

export default function BeiranvandFeaturePage() {
  return (
    <>
      <ArticleSeo
        article={seo}
        breadcrumbs={articleBreadcrumbs(
          "alireza-beiranvand-iran-world-cup-hero",
          article.title,
        )}
        showVisualBreadcrumb={false}
      />
      <EditorialArticleView article={article} />
    </>
  );
}

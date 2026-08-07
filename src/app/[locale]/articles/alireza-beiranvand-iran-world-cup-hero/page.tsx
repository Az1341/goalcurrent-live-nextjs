import type { Metadata } from "next";
import EditorialArticleView from "@/components/news/EditorialArticleView";
import ArticleSeo from "@/components/seo/ArticleSeo";
import { BEIRANVAND_FEATURE } from "@/data/editorial/beiranvand-feature";
import {
  articleBreadcrumbs,
  articleSeoFromSlug,
  buildStaticArticleMetadata,
} from "@/lib/seo/article-seo";

const SLUG = "alireza-beiranvand-iran-world-cup-hero";
const article = BEIRANVAND_FEATURE;
const seo = articleSeoFromSlug(SLUG)!;

export const metadata: Metadata = {
  ...buildStaticArticleMetadata(SLUG),
  keywords: article.keywords,
};

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

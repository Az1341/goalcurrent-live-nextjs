import { notFound } from "next/navigation";
import {
  ARTICLE_OG_SIZE,
  generateArticleOgImageResponse,
  hasDedicatedArticleCardImage,
} from "@/lib/seo/article-og-image";

export const alt = "GoalCurrent.live article share image";
export const size = ARTICLE_OG_SIZE;
export const contentType = "image/png";

type ImageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * File-convention OG image for dynamic article routes.
 * Dedicated ARTICLE_CARD_IMAGES stay wired via metadata — this file only
 * renders the branded fallback when no dedicated card art exists.
 */
export default async function ArticleOpenGraphImage({ params }: ImageProps) {
  const { slug } = await params;
  if (hasDedicatedArticleCardImage(slug)) {
    notFound();
  }
  const image = generateArticleOgImageResponse(slug);
  if (!image) {
    notFound();
  }
  return image;
}

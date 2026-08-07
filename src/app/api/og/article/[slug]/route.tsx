import { generateArticleOgImageResponse } from "@/lib/seo/article-og-image";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const image = generateArticleOgImageResponse(decodeURIComponent(slug));
  if (!image) {
    return new Response("Article not found", { status: 404 });
  }
  return image;
}

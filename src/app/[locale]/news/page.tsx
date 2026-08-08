export const dynamic = "force-dynamic";
export const revalidate = 300;

import type { Metadata } from "next";
import NewsHub from "@/components/news/NewsHub";
import { fetchNewsFeed } from "@/content/readers";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_NAME } from "@/lib/site-url";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "News",
    description: `Latest FIFA World Cup 2026 and football news from BBC Sport, ESPN, and partner feeds on ${SITE_NAME}.`,
    path: "/news",
    locale,
  });
}

export default async function NewsPage() {
  const initialData = await fetchNewsFeed("all");
  return <NewsHub initialData={initialData} />;
}

export const revalidate = 30;

import HomeClient from "@/app/[locale]/HomeClient";
import type { Metadata } from "next";
import HomeFeaturedMatchJsonLd from "@/components/seo/HomeFeaturedMatchJsonLd";
import { getSeoEffectiveFixtures } from "@/lib/wc26/seo-fixtures";
import { HOME_HERO_BG } from "@/lib/critical-assets";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_NAME } from "@/lib/site-url";
import { normalizePageTitleText } from "@/lib/seo/canonical-titles";
import { selectHomeFeaturedContent } from "@/lib/home/featured-selection";

export const metadata: Metadata = buildPageMetadata({
  title: normalizePageTitleText(
    `${SITE_NAME} | Live Football Scores, Fixtures and News`,
  ),
  description: `${SITE_NAME} | live football scores, fixtures, results, standings and news from leagues and tournaments worldwide.`,
  path: "/",
  absoluteTitle: true,
});

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const seoFixtures = getSeoEffectiveFixtures();
  const { wc26Selection } = selectHomeFeaturedContent(seoFixtures);

  return (
    <>
      <link
        rel="preload"
        href={HOME_HERO_BG}
        as="image"
        fetchPriority="high"
        media="(min-width: 768px)"
      />
      {wc26Selection.fixtures.map((fixture) => (
        <HomeFeaturedMatchJsonLd
          key={fixture.id}
          fixture={fixture}
          locale={locale}
        />
      ))}
      <HomeClient />
    </>
  );
}

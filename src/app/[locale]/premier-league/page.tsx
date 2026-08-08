import type { Metadata } from "next";
import PlHubClient from "@/components/pl/PlHubClient";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { buildPageMetadata } from "@/lib/page-metadata";
import { getPlSsotFixtures } from "@/lib/pl/fixtures-ssot";
import { SITE_NAME, absoluteUrl } from "@/lib/site-url";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Premier League 2026/27",
    description: `Premier League 2026/27 hub — table, fixtures, clubs and stats on ${SITE_NAME}.`,
    path: "/premier-league",
    locale,
  });
}

export default function PremierLeagueHubPage() {
  const initialFixtures = getPlSsotFixtures();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: "Premier League",
    sport: "Football",
    url: absoluteUrl("/premier-league"),
  };

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <PlHubClient initialFixtures={initialFixtures} />
    </>
  );
}

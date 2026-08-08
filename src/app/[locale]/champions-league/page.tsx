import type { Metadata } from "next";
import UclHubClient from "@/components/ucl/UclHubClient";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { getCompetition } from "@/lib/competitions/registry";
import { buildPageMetadata } from "@/lib/page-metadata";
import { absoluteUrl } from "@/lib/site-url";
import { UCL_HUB_PATH } from "@/lib/ucl/constants";

const ucl = getCompetition("ucl");

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    ...buildPageMetadata({
      title: ucl.metadata.title,
      description: ucl.metadata.description,
      path: UCL_HUB_PATH,
      locale,
    }),

    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}

export default function ChampionsLeagueHubPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: ucl.displayName,
    sport: "Football",
    url: absoluteUrl(UCL_HUB_PATH),
  };

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <UclHubClient />
    </>
  );
}

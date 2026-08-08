import type { Metadata } from "next";
import UnlHubClient from "@/components/unl/UnlHubClient";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { getCompetition } from "@/lib/competitions/registry";
import { UNL_HUB_PATH } from "@/lib/unl/constants";
import { buildPageMetadata } from "@/lib/page-metadata";
import { absoluteUrl } from "@/lib/site-url";

const unl = getCompetition("unl");

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    ...buildPageMetadata({
      title: unl.metadata.title,
      description: unl.metadata.description,
      path: UNL_HUB_PATH,
      locale,
    }),

    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}

export default function NationsLeagueHubPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: unl.displayName,
    sport: "Football",
    url: absoluteUrl(UNL_HUB_PATH),
  };

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <UnlHubClient />
    </>
  );
}

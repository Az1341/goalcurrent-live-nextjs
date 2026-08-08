import type { Metadata } from "next";
import FacupHubClient from "@/components/facup/FacupHubClient";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { getCompetition } from "@/lib/competitions/registry";
import { FACUP_HUB_PATH } from "@/lib/facup/constants";
import { buildPageMetadata } from "@/lib/page-metadata";
import { absoluteUrl } from "@/lib/site-url";

const facup = getCompetition("facup");

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    ...buildPageMetadata({
      title: facup.metadata.title,
      description: facup.metadata.description,
      path: FACUP_HUB_PATH,
      locale,
    }),

    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}

export default function FaCupHubPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: facup.displayName,
    sport: "Football",
    url: absoluteUrl(FACUP_HUB_PATH),
  };

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <FacupHubClient />
    </>
  );
}

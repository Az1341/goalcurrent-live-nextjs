import type { Metadata } from "next";
import DomesticLeagueHubClient from "@/components/league/DomesticLeagueHubClient";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { buildPageMetadata } from "@/lib/page-metadata";
import { fetchLaLigaFixtures, fetchLaLigaStandings } from "@/lib/la-liga/api";
import {
  LALIGA_DISPLAY_NAME,
  LALIGA_HUB_PATH,
  LALIGA_LEAGUE_NAME,
  LALIGA_SEASON_LABEL,
} from "@/lib/la-liga/constants";
import { SITE_NAME, absoluteUrl } from "@/lib/site-url";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: LALIGA_DISPLAY_NAME,
    description: `${LALIGA_DISPLAY_NAME} fixtures and standings on ${SITE_NAME}.`,
    path: LALIGA_HUB_PATH,
    locale,
  });
}

export default async function LaLigaHubPage() {
  const [initialFixtures, initialStandings] = await Promise.all([
    fetchLaLigaFixtures(),
    fetchLaLigaStandings(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: LALIGA_LEAGUE_NAME,
    sport: "Football",
    url: absoluteUrl(LALIGA_HUB_PATH),
  };

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <DomesticLeagueHubClient
        config={{
          displayName: LALIGA_DISPLAY_NAME,
          seasonLabel: LALIGA_SEASON_LABEL,
          competitionLabel: LALIGA_DISPLAY_NAME,
          fixturesApiPath: "/api/la-liga/fixtures",
          standingsApiPath: "/api/la-liga/standings",
        }}
        initialFixtures={initialFixtures}
        initialStandings={initialStandings}
      />
    </>
  );
}

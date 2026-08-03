import type { Metadata } from "next";
import DomesticLeagueHubClient from "@/components/league/DomesticLeagueHubClient";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { buildPageMetadata } from "@/lib/page-metadata";
import { fetchSerieAFixtures, fetchSerieAStandings } from "@/lib/serie-a/api";
import {
  SERIEA_DISPLAY_NAME,
  SERIEA_HUB_PATH,
  SERIEA_LEAGUE_NAME,
  SERIEA_SEASON_LABEL,
} from "@/lib/serie-a/constants";
import { SITE_NAME, absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = buildPageMetadata({
  title: SERIEA_DISPLAY_NAME,
  description: `${SERIEA_DISPLAY_NAME} fixtures and standings on ${SITE_NAME}.`,
  path: SERIEA_HUB_PATH,
});

export default async function SerieAHubPage() {
  const [initialFixtures, initialStandings] = await Promise.all([
    fetchSerieAFixtures(),
    fetchSerieAStandings(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: SERIEA_LEAGUE_NAME,
    sport: "Football",
    url: absoluteUrl(SERIEA_HUB_PATH),
  };

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <DomesticLeagueHubClient
        config={{
          displayName: SERIEA_DISPLAY_NAME,
          seasonLabel: SERIEA_SEASON_LABEL,
          competitionLabel: SERIEA_DISPLAY_NAME,
          fixturesApiPath: "/api/serie-a/fixtures",
          standingsApiPath: "/api/serie-a/standings",
        }}
        initialFixtures={initialFixtures}
        initialStandings={initialStandings}
      />
    </>
  );
}

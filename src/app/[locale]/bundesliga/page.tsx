import type { Metadata } from "next";
import DomesticLeagueHubClient from "@/components/league/DomesticLeagueHubClient";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { buildPageMetadata } from "@/lib/page-metadata";
import {
  fetchBundesligaFixtures,
  fetchBundesligaStandings,
} from "@/lib/bundesliga/api";
import {
  BUNDESLIGA_DISPLAY_NAME,
  BUNDESLIGA_HUB_PATH,
  BUNDESLIGA_LEAGUE_NAME,
  BUNDESLIGA_SEASON_LABEL,
} from "@/lib/bundesliga/constants";
import { SITE_NAME, absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = buildPageMetadata({
  title: BUNDESLIGA_DISPLAY_NAME,
  description: `${BUNDESLIGA_DISPLAY_NAME} fixtures and standings on ${SITE_NAME}.`,
  path: BUNDESLIGA_HUB_PATH,
});

export default async function BundesligaHubPage() {
  const [initialFixtures, initialStandings] = await Promise.all([
    fetchBundesligaFixtures(),
    fetchBundesligaStandings(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: BUNDESLIGA_LEAGUE_NAME,
    sport: "Football",
    url: absoluteUrl(BUNDESLIGA_HUB_PATH),
  };

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <DomesticLeagueHubClient
        config={{
          displayName: BUNDESLIGA_DISPLAY_NAME,
          seasonLabel: BUNDESLIGA_SEASON_LABEL,
          competitionLabel: BUNDESLIGA_DISPLAY_NAME,
          fixturesApiPath: "/api/bundesliga/fixtures",
          standingsApiPath: "/api/bundesliga/standings",
        }}
        initialFixtures={initialFixtures}
        initialStandings={initialStandings}
      />
    </>
  );
}

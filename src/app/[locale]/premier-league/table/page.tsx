import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import PlTableClient from "@/components/pl/PlTableClient";
import JsonLd from "@/components/seo/JsonLd";
import { fetchPlStandings } from "@/lib/pl/api";
import { getPlSsotFixtures } from "@/lib/pl/fixtures-ssot";
import {
  buildZeroStandingsFromTeams,
  resolveDisplayStandings,
} from "@/lib/pl/standings-display";
import type { PlFixtureRow, PlStandingsApiResponse } from "@/lib/pl/types";
import { buildPageMetadata } from "@/lib/page-metadata";
import { rankingListSchema } from "@/lib/seo/schema";
import { SITE_NAME } from "@/lib/site-url";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Premier League Table 2026/27",
    description: `Premier League 2026/27 standings on ${SITE_NAME}.`,
    path: "/premier-league/table",
    locale,
  });
}

function teamsFromFixtures(fixtures: PlFixtureRow[]) {
  const teams = new Map<
    number,
    { id: number; name: string; logo: string | null }
  >();
  for (const fixture of fixtures) {
    teams.set(fixture.homeTeamId, {
      id: fixture.homeTeamId,
      name: fixture.homeTeamName,
      logo: fixture.homeTeamLogo,
    });
    teams.set(fixture.awayTeamId, {
      id: fixture.awayTeamId,
      name: fixture.awayTeamName,
      logo: fixture.awayTeamLogo,
    });
  }
  return [...teams.values()];
}

export default async function PremierLeagueTablePage() {
  const locale = await getLocale();
  const body = await fetchPlStandings();
  let standings = resolveDisplayStandings(body.standings);

  if (!standings.length) {
    standings = resolveDisplayStandings(
      buildZeroStandingsFromTeams(teamsFromFixtures(getPlSsotFixtures())),
    );
  }

  const initialData: PlStandingsApiResponse = {
    ...body,
    standings,
    error: standings.length ? undefined : body.error,
  };

  const schema = rankingListSchema({
    path: "/premier-league/table",
    name: "Premier League Table 2026/27",
    description: `Premier League 2026/27 standings on ${SITE_NAME}.`,
    locale,
    itemType: "SportsTeam",
    competitionName: "Premier League",
    items: standings.map((row) => ({
      position: row.rank,
      name: row.teamName,
      metricName: "points",
      metricValue: row.points,
      played: row.played,
    })),
  });

  return (
    <>
      {schema ? <JsonLd data={schema} /> : null}
      <PlTableClient initialData={initialData} />
    </>
  );
}

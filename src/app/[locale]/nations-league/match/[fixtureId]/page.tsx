import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MatchSeo from "@/components/seo/MatchSeo";
import UnlMatchClient from "@/components/unl/UnlMatchClient";
import { getUnlSsotFixtureById } from "@/lib/unl/fixtures-ssot";
import { UNL_DISPLAY_NAME, UNL_HUB_PATH } from "@/lib/unl/constants";
import { sportsEventStatus } from "@/lib/seo/sports-event-status";
import { SITE_NAME } from "@/lib/site-url";

type PageProps = {
  params: Promise<{ locale: string; fixtureId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { fixtureId } = await params;
  const id = Number(fixtureId);
  const fixture = getUnlSsotFixtureById(id);
  if (!fixture) {
    return { title: `Match — ${UNL_DISPLAY_NAME}` };
  }
  return {
    title: `${fixture.homeTeamName} vs ${fixture.awayTeamName} — ${UNL_DISPLAY_NAME}`,
    description: `${fixture.homeTeamName} vs ${fixture.awayTeamName} · Nations League ${fixture.groupId.toUpperCase()}`,
  };
}

export default async function UnlMatchPage({ params }: PageProps) {
  const { fixtureId } = await params;
  const id = Number(fixtureId);
  if (!Number.isFinite(id) || id <= 0) notFound();
  const fixture = getUnlSsotFixtureById(id);
  if (!fixture) notFound();

  const path = `${UNL_HUB_PATH}/match/${fixture.fixtureId}`;
  const name = `${fixture.homeTeamName} vs ${fixture.awayTeamName}`;

  return (
    <>
      <MatchSeo
        event={{
          name,
          // Absolute UTC kickoff (same pattern as PL); UI may localise for display.
          startDate: fixture.kickoffUtc,
          path,
          homeTeamName: fixture.homeTeamName,
          awayTeamName: fixture.awayTeamName,
          competition: UNL_DISPLAY_NAME,
          organizerUrl: "https://www.uefa.com/uefanationsleague/",
          eventStatus: sportsEventStatus(fixture.status),
          description: `${UNL_DISPLAY_NAME} — ${name}. Live match centre on ${SITE_NAME}.`,
        }}
        breadcrumbs={[
          { name: UNL_DISPLAY_NAME, path: UNL_HUB_PATH },
          { name: "Fixtures", path: `${UNL_HUB_PATH}#unl-fixtures` },
          { name, path },
        ]}
      />
      <UnlMatchClient fixture={fixture} />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TeamSeo from "@/components/seo/TeamSeo";
import Wc26TeamProfileClient from "@/components/team-profile/Wc26TeamProfileClient";
import { getTeamById, WC26_TEAMS } from "@/data/wc26";
import { isKnownTeamId, teamHref } from "@/lib/wc26-teams";
import { buildWc26TeamMetadata } from "@/lib/team-profile/metadata";
import { absoluteUrl } from "@/lib/site-url";

type TeamPageProps = {
  params: Promise<{ locale: string; teamId: string }>;
};

export function generateStaticParams() {
  return WC26_TEAMS.map((team) => ({
    teamId: team.id,
  }));
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { locale, teamId: rawId } = await params;
  const teamId = decodeURIComponent(rawId);
  const team = getTeamById(teamId);

  if (!team) {
    return { title: "Team — World Cup 2026" };
  }

  return buildWc26TeamMetadata(team, locale);
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId: rawId } = await params;
  const teamId = decodeURIComponent(rawId);

  if (!isKnownTeamId(teamId)) {
    notFound();
  }

  const team = getTeamById(teamId)!;
  const path = teamHref(teamId);

  return (
    <>
      <TeamSeo
        team={{
          name: team.name,
          url: absoluteUrl(path),
          memberOfName: "FIFA World Cup 2026",
          memberOfType: "SportsOrganization",
        }}
        breadcrumbs={[
          { name: "World Cup 2026", path: "/worldcup2026" },
          { name: "Teams", path: "/worldcup2026/teams" },
          { name: team.name, path },
        ]}
      />
      <Wc26TeamProfileClient teamId={teamId} />
    </>
  );
}

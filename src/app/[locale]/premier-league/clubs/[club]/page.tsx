import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TeamSeo from "@/components/seo/TeamSeo";
import TeamSupportBar from "@/components/favourites/TeamSupportBar";
import PlClubProfileClient from "@/components/team-profile/PlClubProfileClient";
import { getClubBySlug, getAllClubSlugs } from "@/data/pl-clubs";
import { canonicalPlTeamKey } from "@/lib/favourite-entities";
import { buildPlClubMetadata } from "@/lib/team-profile/metadata";
import { clubHref } from "@/lib/team-profile/club-slug";
import { absoluteUrl } from "@/lib/site-url";

type PageProps = { params: Promise<{ locale: string; club: string }> };

export function generateStaticParams() {
  return getAllClubSlugs().map((slug) => ({ club: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, club } = await params;
  const data = getClubBySlug(club);
  if (!data) return { title: "Club — Premier League" };
  return buildPlClubMetadata(data, locale);
}

export default async function ClubPage({ params }: PageProps) {
  const { club } = await params;
  const data = getClubBySlug(club);
  if (!data) notFound();

  const path = clubHref(data.slug);

  return (
    <>
      <TeamSeo
        team={{
          name: data.name,
          url: absoluteUrl(path),
          memberOfName: "Premier League",
          memberOfType: "SportsOrganization",
          locationName: data.stadium,
        }}
        breadcrumbs={[
          { name: "Premier League", path: "/premier-league" },
          { name: "Clubs", path: "/premier-league/clubs" },
          { name: data.name, path },
        ]}
      />
      <TeamSupportBar
        teamKey={canonicalPlTeamKey(data.slug)}
        teamName={data.name}
      />
      <PlClubProfileClient club={data} />
    </>
  );
}
import type { Metadata } from "next";
import PlClubsClient from "@/components/pl/PlClubsClient";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SITE_NAME } from "@/lib/site-url";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Premier League Clubs 2026/27",
    description: `Premier League clubs for 2026/27 on ${SITE_NAME} — from official API data.`,
    path: "/premier-league/clubs",
    locale,
  });
}

export default function PremierLeagueClubsPage() {
  return <PlClubsClient />;
}

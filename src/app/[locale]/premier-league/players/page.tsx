import type { Metadata } from "next";
import PlPlayersClient from "@/components/pl/PlPlayersClient";
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
    title: "Premier League Players 2026/27",
    description: `Premier League players for 2026/27 on ${SITE_NAME} — from official API data.`,
    path: "/premier-league/players",
    locale,
  });
}

export default function PremierLeaguePlayersPage() {
  return <PlPlayersClient />;
}

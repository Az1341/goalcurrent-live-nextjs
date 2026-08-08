import type { Metadata } from "next";
import PlFixturesClient from "@/components/pl/PlFixturesClient";
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
    title: "Premier League Fixtures 2026/27",
    description: `Premier League 2026/27 fixtures on ${SITE_NAME}.`,
    path: "/premier-league/fixtures",
    locale,
  });
}

export default function PremierLeagueFixturesPage() {
  return <PlFixturesClient />;
}

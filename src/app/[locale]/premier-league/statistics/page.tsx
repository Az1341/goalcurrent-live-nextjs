import type { Metadata } from "next";
import PlStatisticsClient from "@/components/pl/PlStatisticsClient";
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
    title: "Premier League Statistics 2026/27",
    description: `Premier League statistics for 2026/27 on ${SITE_NAME} — top scorers, assists and more.`,
    path: "/premier-league/statistics",
    locale,
  });
}

export default function PremierLeagueStatisticsPage() {
  return <PlStatisticsClient />;
}

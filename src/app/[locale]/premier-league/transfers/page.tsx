import type { Metadata } from "next";
import PlTransfersClient from "@/components/pl/PlTransfersClient";
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
    title: "Premier League Transfers 2026/27",
    description: `Premier League transfers for 2026/27 on ${SITE_NAME} when supported by the data source.`,
    path: "/premier-league/transfers",
    locale,
  });
}

export default function PremierLeagueTransfersPage() {
  return <PlTransfersClient />;
}

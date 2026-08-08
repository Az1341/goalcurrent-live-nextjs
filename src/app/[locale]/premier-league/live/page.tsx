import type { Metadata } from "next";
import PlLiveClient from "@/components/pl/PlLiveClient";
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
    title: "Premier League Live Matches 2026/27",
    description: `Live Premier League matches for 2026/27 on ${SITE_NAME}.`,
    path: "/premier-league/live",
    locale,
  });
}

export default function PremierLeagueLivePage() {
  return <PlLiveClient />;
}

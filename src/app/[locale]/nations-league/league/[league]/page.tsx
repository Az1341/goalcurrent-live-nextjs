import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UnlLeagueClient from "@/components/unl/UnlLeagueClient";
import { buildPageMetadata } from "@/lib/page-metadata";
import {
  UNL_DISPLAY_NAME,
  UNL_LEAGUES,
  UNL_SEASON_LABEL,
  type UnlLeagueId,
} from "@/lib/unl/constants";

type PageProps = {
  params: Promise<{ locale: string; league: string }>;
};

function parseLeague(raw: string): UnlLeagueId | null {
  const id = raw.trim().toLowerCase();
  return (UNL_LEAGUES as readonly string[]).includes(id)
    ? (id as UnlLeagueId)
    : null;
}

export function generateStaticParams() {
  return UNL_LEAGUES.map((league) => ({ league }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, league: raw } = await params;
  const league = parseLeague(raw);
  const label = league ? `League ${league.toUpperCase()}` : "League";
  return buildPageMetadata({
    title: `${UNL_DISPLAY_NAME} · ${label}`,
    description: `${label} groups and teams for UEFA Nations League ${UNL_SEASON_LABEL}.`,
    path: league ? `/nations-league/league/${league}` : "/nations-league",
    locale,
  });
}

export default async function NationsLeagueLeaguePage({ params }: PageProps) {
  const { league: raw } = await params;
  const league = parseLeague(raw);
  if (!league) notFound();
  return <UnlLeagueClient league={league} />;
}

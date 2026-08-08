import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UnlGroupClient from "@/components/unl/UnlGroupClient";
import { buildPageMetadata } from "@/lib/page-metadata";
import {
  UNL_DISPLAY_NAME,
  UNL_GROUP_IDS,
  UNL_LEAGUES,
  UNL_SEASON_LABEL,
  type UnlGroupId,
  type UnlLeagueId,
} from "@/lib/unl/constants";
import { isUnlGroupId } from "@/lib/unl/contract";

type PageProps = {
  params: Promise<{ locale: string; league: string; group: string }>;
};

function parseLeague(raw: string): UnlLeagueId | null {
  const id = raw.trim().toLowerCase();
  return (UNL_LEAGUES as readonly string[]).includes(id)
    ? (id as UnlLeagueId)
    : null;
}

function parseGroup(league: UnlLeagueId, rawGroup: string): UnlGroupId | null {
  const num = Number.parseInt(rawGroup.trim(), 10);
  const max = league === "d" ? 2 : 4;
  if (!Number.isFinite(num) || num < 1 || num > max) return null;
  const groupId = `${league}${num}`;
  return isUnlGroupId(groupId) ? groupId : null;
}

export function generateStaticParams() {
  return UNL_GROUP_IDS.map((groupId) => ({
    league: groupId.charAt(0),
    group: groupId.slice(1),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, league: rawLeague, group: rawGroup } = await params;
  const league = parseLeague(rawLeague);
  const groupId = league ? parseGroup(league, rawGroup) : null;
  const label = groupId ? `Group ${groupId.toUpperCase()}` : "Group";
  return buildPageMetadata({
    title: `${UNL_DISPLAY_NAME} · ${label}`,
    description: `${label} table, fixtures and results for UEFA Nations League ${UNL_SEASON_LABEL}.`,
    path:
      league && groupId
        ? `/nations-league/league/${league}/group/${groupId.slice(1)}`
        : "/nations-league",
    locale,
  });
}

export default async function NationsLeagueGroupPage({ params }: PageProps) {
  const { league: rawLeague, group: rawGroup } = await params;
  const league = parseLeague(rawLeague);
  if (!league) notFound();
  const groupId = parseGroup(league, rawGroup);
  if (!groupId) notFound();
  return <UnlGroupClient league={league} groupId={groupId} />;
}

/**
 * UEFA Nations League 2026/27 groups SSOT (league phase draw).
 */

import groupsPayload from "@/data/unl/groups-2026-27.json";
import {
  UNL_GROUP_IDS,
  type UnlGroupId,
  type UnlLeagueId,
} from "@/lib/unl/constants";
import { isUnlGroupId } from "@/lib/unl/contract";
import type { UnlGroup, UnlTeam } from "@/lib/unl/types";

type RawTeam = {
  teamId: number;
  name: string;
  flagCode: string;
  logo: string | null;
};

type RawGroup = {
  groupId: string;
  league: string;
  label: string;
  teams: RawTeam[];
};

function normaliseTeam(team: RawTeam): UnlTeam {
  return {
    teamId: team.teamId,
    name: team.name,
    flagCode: team.flagCode,
    logo: team.logo ?? null,
  };
}

function normaliseGroup(group: RawGroup): UnlGroup | null {
  if (!isUnlGroupId(group.groupId)) return null;
  const league = group.league.toLowerCase() as UnlLeagueId;
  if (!["a", "b", "c", "d"].includes(league)) return null;
  return {
    groupId: group.groupId,
    league,
    label: group.label,
    teams: (group.teams ?? []).map(normaliseTeam),
  };
}

export function getUnlGroups(): UnlGroup[] {
  const groups = (groupsPayload.groups as RawGroup[])
    .map(normaliseGroup)
    .filter((g): g is UnlGroup => g !== null);

  const order = new Map(
    UNL_GROUP_IDS.map((id, index) => [id, index] as const),
  );
  return groups.sort(
    (a, b) => (order.get(a.groupId) ?? 0) - (order.get(b.groupId) ?? 0),
  );
}

export function getUnlGroup(groupId: string): UnlGroup | undefined {
  if (!isUnlGroupId(groupId)) return undefined;
  return getUnlGroups().find((g) => g.groupId === groupId);
}

export function getUnlGroupsByLeague(league: UnlLeagueId | string): UnlGroup[] {
  const key = league.toLowerCase();
  return getUnlGroups().filter((g) => g.league === key);
}

export function getUnlGroupsMeta(): {
  source: string;
  sourceUrl: string;
  season: number;
  seasonLabel: string;
} {
  return {
    source: groupsPayload.source,
    sourceUrl: groupsPayload.sourceUrl,
    season: groupsPayload.season,
    seasonLabel: groupsPayload.seasonLabel,
  };
}

export type { UnlGroupId };
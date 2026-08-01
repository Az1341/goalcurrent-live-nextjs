/**
 * UEFA Nations League 2026/27 league-phase fixtures SSOT.
 */

import fixturesPayload from "@/data/unl/fixtures-2026-27.json";
import { isUnlGroupId, mapUnlFixtureStatus } from "@/lib/unl/contract";
import type { UnlLeagueId } from "@/lib/unl/constants";
import type { UnlFixtureRow } from "@/lib/unl/types";

type RawFixture = {
  fixtureId: number;
  matchday: number;
  groupId: string;
  league: string;
  round: string | null;
  kickoffUtc: string;
  kickoffCet?: string;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamFlag: string | null;
  homeTeamLogo: string | null;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamFlag: string | null;
  awayTeamLogo: string | null;
  status: string;
  statusShort: string;
  elapsed: number | null;
  homeScore: number | null;
  awayScore: number | null;
};

function normaliseFixture(row: RawFixture): UnlFixtureRow | null {
  if (!isUnlGroupId(row.groupId)) return null;
  const league = row.league.toLowerCase() as UnlLeagueId;
  if (!["a", "b", "c", "d"].includes(league)) return null;
  const status = mapUnlFixtureStatus(row.statusShort || row.status);
  return {
    fixtureId: row.fixtureId,
    kickoffUtc: row.kickoffUtc,
    kickoffCet: row.kickoffCet,
    matchday: row.matchday,
    groupId: row.groupId,
    league,
    round: row.round ?? null,
    homeTeamId: row.homeTeamId,
    homeTeamName: row.homeTeamName,
    homeTeamFlag: row.homeTeamFlag ?? null,
    homeTeamLogo: row.homeTeamLogo ?? null,
    awayTeamId: row.awayTeamId,
    awayTeamName: row.awayTeamName,
    awayTeamFlag: row.awayTeamFlag ?? null,
    awayTeamLogo: row.awayTeamLogo ?? null,
    status,
    statusShort: row.statusShort,
    elapsed: row.elapsed ?? null,
    homeScore: row.homeScore,
    awayScore: row.awayScore,
  };
}

export function getUnlSsotFixtures(): UnlFixtureRow[] {
  return (fixturesPayload.fixtures as RawFixture[])
    .map(normaliseFixture)
    .filter((row): row is UnlFixtureRow => row !== null)
    .sort(
      (a, b) =>
        new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime(),
    );
}

export function getUnlSsotFixturesByGroup(groupId: string): UnlFixtureRow[] {
  if (!isUnlGroupId(groupId)) return [];
  return getUnlSsotFixtures().filter((row) => row.groupId === groupId);
}

export function getUnlSsotFixtureById(
  fixtureId: number,
): UnlFixtureRow | undefined {
  if (!Number.isFinite(fixtureId) || fixtureId <= 0) return undefined;
  return getUnlSsotFixtures().find((row) => row.fixtureId === fixtureId);
}

export function getUnlSsotMeta(): {
  source: string;
  sourceUrl: string;
  count: number;
  season: number;
} {
  return {
    source: fixturesPayload.source,
    sourceUrl: fixturesPayload.sourceUrl,
    count: fixturesPayload.count,
    season: fixturesPayload.season,
  };
}
/**
 * UNL fixtures / standings fetch layer.
 * Prefer SSOT for now; configured flag reflects API-Football key presence.
 */

import { isApiFootballConfigured } from "@/lib/api-football/client";
import {
  UNL_DISPLAY_NAME,
  UNL_FIXTURES_CACHE_ACTIVE,
  UNL_FIXTURES_CACHE_EMPTY,
  UNL_LEAGUE_ID,
  UNL_SEASON,
  UNL_STANDINGS_CACHE_ACTIVE,
  UNL_STANDINGS_CACHE_UNAVAILABLE,
  type UnlGroupId,
} from "@/lib/unl/constants";
import {
  isUnlGroupId,
  sanitiseUnlProviderError,
} from "@/lib/unl/contract";
import { getUnlSsotFixtures } from "@/lib/unl/fixtures-ssot";
import { getUnlGroups } from "@/lib/unl/groups-ssot";
import { computeStandingsFromFixtures } from "@/lib/unl/standings";
import type {
  UnlDataSource,
  UnlFixturesApiResponse,
  UnlStandingsApiResponse,
} from "@/lib/unl/types";

export function isUnlApiConfigured(): boolean {
  return isApiFootballConfigured();
}

function baseFixtures(
  source: UnlDataSource,
  overrides: Partial<UnlFixturesApiResponse> = {},
): UnlFixturesApiResponse {
  return {
    configured: isUnlApiConfigured(),
    competitionKey: "unl",
    league: UNL_DISPLAY_NAME,
    leagueId: UNL_LEAGUE_ID,
    season: UNL_SEASON,
    fixtures: [],
    source,
    fetchedAt: new Date().toISOString(),
    ...overrides,
  };
}

function baseStandings(
  source: UnlDataSource,
  overrides: Partial<UnlStandingsApiResponse> = {},
): UnlStandingsApiResponse {
  return {
    configured: isUnlApiConfigured(),
    competitionKey: "unl",
    league: UNL_DISPLAY_NAME,
    leagueId: UNL_LEAGUE_ID,
    season: UNL_SEASON,
    standings: [],
    standingsAvailable: false,
    source,
    fetchedAt: new Date().toISOString(),
    ...overrides,
  };
}

/** Always returns SSOT fixtures (primary fallback). Source is "fallback". */
export async function fetchUnlFixtures(): Promise<UnlFixturesApiResponse> {
  const fixtures = getUnlSsotFixtures();
  return baseFixtures("fallback", {
    fixtures,
    configured: isUnlApiConfigured(),
  });
}

/**
 * Standings computed from SSOT fixtures.
 * When `groupId` is set, returns that group only; otherwise all groups.
 */
export async function fetchUnlStandings(
  groupId?: string,
): Promise<UnlStandingsApiResponse> {
  const fixtures = getUnlSsotFixtures();

  if (groupId != null && groupId !== "") {
    if (!isUnlGroupId(groupId)) {
      return baseStandings("fallback", {
        standings: [],
        standingsAvailable: false,
        groupId: null,
        error: "Unknown Nations League group.",
      });
    }
    const standings = computeStandingsFromFixtures(fixtures, groupId);
    return baseStandings("fallback", {
      standings,
      standingsAvailable: standings.length > 0,
      groupId: groupId as UnlGroupId,
    });
  }

  const standings = getUnlGroups().flatMap((group) =>
    computeStandingsFromFixtures(fixtures, group.groupId),
  );
  return baseStandings("fallback", {
    standings,
    standingsAvailable: standings.length > 0,
    groupId: null,
  });
}

export function unlFixturesCacheControl(body: UnlFixturesApiResponse): string {
  if (body.fixtures.length > 0) {
    return `s-maxage=${UNL_FIXTURES_CACHE_ACTIVE}, stale-while-revalidate=60`;
  }
  return `s-maxage=${UNL_FIXTURES_CACHE_EMPTY}, stale-while-revalidate=300`;
}

export function unlStandingsCacheControl(body: UnlStandingsApiResponse): string {
  if (body.standingsAvailable && body.standings.length > 0) {
    return `s-maxage=${UNL_STANDINGS_CACHE_ACTIVE}, stale-while-revalidate=60`;
  }
  return `s-maxage=${UNL_STANDINGS_CACHE_UNAVAILABLE}, stale-while-revalidate=300`;
}

export function unlClientErrorMessage(body: { error?: string }): string {
  return sanitiseUnlProviderError(body.error);
}
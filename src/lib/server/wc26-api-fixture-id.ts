import { WC26_FIXTURES, getFixtureById } from "@/data/wc26";
import { isKnockoutPlaceholderTeam } from "@/data/wc26/knockout-fixtures";
import {
  findFixtureIdByKickoffUtc,
  findFixtureIdByKnockoutTeamPairOverride,
  findFixtureIdByTeamNames,
} from "@/lib/wc26-fixture-match";
import { resolveFixtureParticipant } from "@/lib/wc26-live";
import { resolveTeamId } from "@/lib/teamIdentity";
import type { EffectiveFixture } from "@/lib/wc26-fixture-overlay";

/** api-sports World Cup league id (BE-004 ownership bind). */
export const WC26_API_LEAGUE_ID = 1;
/** api-sports World Cup season year used by GoalCurrent WC26 feeds. */
export const WC26_API_SEASON = 2026;

export type ApiFixtureLookupRow = {
  fixture: { id: number; date: string };
  teams: { home: { name: string }; away: { name: string } };
};

/** API fixture row including league/season — used for ownership bind (BE-004). */
export type ApiFixtureOwnershipRow = ApiFixtureLookupRow & {
  league: { id: number; season: number };
};

/**
 * BE-004 — classify a caller-supplied apiFixtureId before upstream fan-out.
 * Registry match is trusted (scores sync already WC-scoped). Registry mismatch
 * is always rejected. Unregistered ids require league/season/fixture verify.
 */
export type KnownWc26ApiFixtureTrust =
  | { action: "use"; apiFixtureId: number }
  | { action: "reject"; reason: "registry_mismatch" }
  | { action: "verify"; apiFixtureId: number }
  | { action: "none" };

export function classifyKnownWc26ApiFixtureId(
  knownApiFixtureId: number | null | undefined,
  registeredApiFixtureId: number | null | undefined,
): KnownWc26ApiFixtureTrust {
  if (knownApiFixtureId == null || !Number.isFinite(knownApiFixtureId) || knownApiFixtureId <= 0) {
    return { action: "none" };
  }
  if (registeredApiFixtureId != null && Number.isFinite(registeredApiFixtureId)) {
    if (registeredApiFixtureId === knownApiFixtureId) {
      return { action: "use", apiFixtureId: knownApiFixtureId };
    }
    return { action: "reject", reason: "registry_mismatch" };
  }
  return { action: "verify", apiFixtureId: knownApiFixtureId };
}

/** True when the API row is WC26 league/season and maps to the local fixture. */
export function isWc26ApiFixtureOwnershipBound(
  localFixtureId: string,
  row: ApiFixtureOwnershipRow,
): boolean {
  if (row.league.id !== WC26_API_LEAGUE_ID) {
    return false;
  }
  if (row.league.season !== WC26_API_SEASON) {
    return false;
  }
  if (!Number.isFinite(row.fixture.id) || row.fixture.id <= 0) {
    return false;
  }
  return resolveApiFixtureIdForLocal(localFixtureId, [row]) === row.fixture.id;
}

/** Map a local WC26 fixture id to an api-sports fixture id from API rows. */
export function resolveApiFixtureIdForLocal(
  localFixtureId: string,
  rows: readonly ApiFixtureLookupRow[],
): number | null {
  const fixture = getFixtureById(localFixtureId);
  if (!fixture) {
    return null;
  }

  for (const row of rows) {
    const byTeams = findFixtureIdByTeamNames(
      row.teams.home.name,
      row.teams.away.name,
    );
    if (byTeams === localFixtureId) {
      return row.fixture.id;
    }
    const byOverride = findFixtureIdByKnockoutTeamPairOverride(
      row.teams.home.name,
      row.teams.away.name,
    );
    if (byOverride === localFixtureId) {
      return row.fixture.id;
    }
  }

  for (const row of rows) {
    if (findFixtureIdByKickoffUtc(row.fixture.date) === localFixtureId) {
      return row.fixture.id;
    }
  }

  if (isKnockoutPlaceholderTeam(fixture.homeTeamId)) {
    const home = resolveFixtureParticipant(
      fixture as EffectiveFixture,
      "home",
      WC26_FIXTURES,
    );
    const away = resolveFixtureParticipant(
      fixture as EffectiveFixture,
      "away",
      WC26_FIXTURES,
    );

    for (const row of rows) {
      const apiHome = resolveTeamId(row.teams.home.name);
      const apiAway = resolveTeamId(row.teams.away.name);
      if (!apiHome || !apiAway || isKnockoutPlaceholderTeam(apiHome)) {
        continue;
      }
      if (
        (apiHome === home.teamId && apiAway === away.teamId) ||
        (apiHome === away.teamId && apiAway === home.teamId)
      ) {
        return row.fixture.id;
      }
    }
  }

  return null;
}

export function kickoffDateRange(kickoffUtc: string): readonly string[] {
  const base = kickoffUtc.slice(0, 10);
  const dayMs = 24 * 60 * 60 * 1000;
  const parsed = Date.parse(`${base}T00:00:00.000Z`);
  if (!Number.isFinite(parsed)) {
    return [base];
  }
  const prev = new Date(parsed - dayMs).toISOString().slice(0, 10);
  const next = new Date(parsed + dayMs).toISOString().slice(0, 10);
  return [prev, base, next];
}

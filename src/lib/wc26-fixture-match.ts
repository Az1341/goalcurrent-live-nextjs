import { WC26_FIXTURES, getGroupById } from "@/data/wc26";
import { isKnockoutPlaceholderTeam } from "@/data/wc26/knockout-fixtures";
import type { EffectiveFixture } from "@/lib/wc26-fixture-overlay";
import type { BracketSlotRef } from "@/lib/wc26/bracket-types";
import { FIFA_ROUND_OF_32_TEMPLATES } from "@/lib/wc26/fifa-bracket-mapping";
import { computeGroupStandings } from "@/lib/wc26-standings";
import { resolveFixtureParticipant } from "@/lib/wc26-live";
import { resolveTeamId } from "@/lib/teamIdentity";
import type { TeamId } from "@/types/team";

const fixtureIdByTeamPair = new Map<string, string>();
const fixtureIdByMatchNumber = new Map<number, string>();
const fixtureKickoffMs = new Map<string, number>();

for (const fixture of WC26_FIXTURES) {
  fixtureIdByTeamPair.set(
    teamPairKey(fixture.homeTeamId, fixture.awayTeamId),
    fixture.id,
  );
  fixtureIdByMatchNumber.set(fixture.matchNumber, fixture.id);
  fixtureKickoffMs.set(fixture.id, Date.parse(fixture.kickoffUtc));
}

function teamPairKey(homeTeamId: TeamId, awayTeamId: TeamId): string {
  return `${homeTeamId}|${awayTeamId}`;
}

function sortedTeamPairKey(left: TeamId, right: TeamId): string {
  return [left, right].sort().join("|");
}

/**
 * Confirmed round-of-32 API pairings → local fixture id (order-independent).
 * Overrides kickoff/standings heuristics that collide on matches 75 vs 76.
 */
const KNOCKOUT_TEAM_PAIR_TO_FIXTURE_ID: Readonly<Record<string, string>> = {
  "can|rsa": "fixture-073",
  "ger|par": "fixture-074",
  "bra|jpn": "fixture-076",
  "mar|ned": "fixture-075",
  "fra|swe": "fixture-077",
  "civ|nor": "fixture-078",
  "ecu|mex": "fixture-079",
  "cod|eng": "fixture-080",
  "bih|usa": "fixture-081",
  "bel|sen": "fixture-082",
  "por|cro": "fixture-083",
  "aut|esp": "fixture-084",
  "alg|sui": "fixture-085",
  "arg|cpv": "fixture-086",
  "col|gha": "fixture-087",
  "aus|egy": "fixture-088",
  // Round of 16 — FIFA-verified pairings (order-independent)
  "fra|par": "fixture-089",
  "can|mar": "fixture-090",
  "bra|nor": "fixture-091",
  "eng|mex": "fixture-092",
  "esp|por": "fixture-093",
  "bel|usa": "fixture-094",
  "arg|egy": "fixture-095",
  "col|sui": "fixture-096",
  "fra|mar": "fixture-097",
  "eng|nor": "fixture-099",
  "fra|esp": "fixture-101",
  "arg|eng": "fixture-102",
  "eng|fra": "fixture-103",
};

/** Resolve a knockout fixture id from a known API team pairing. */
export function findFixtureIdByKnockoutTeamPairOverride(
  homeName: string,
  awayName: string,
): string | undefined {
  const homeTeamId = resolveTeamId(homeName);
  const awayTeamId = resolveTeamId(awayName);
  if (!homeTeamId || !awayTeamId) {
    return undefined;
  }
  return KNOCKOUT_TEAM_PAIR_TO_FIXTURE_ID[
    sortedTeamPairKey(homeTeamId, awayTeamId)
  ];
}

/** Knockout kickoff fallback — tight window to avoid cross-slot collisions. */
const KICKOFF_MATCH_TOLERANCE_MS = 90 * 60 * 1000;

/** Resolve a local WC26 fixture id from API team names. */
export function findFixtureIdByTeamNames(
  homeName: string,
  awayName: string,
): string | undefined {
  const homeTeamId = resolveTeamId(homeName);
  const awayTeamId = resolveTeamId(awayName);
  if (!homeTeamId || !awayTeamId) {
    return undefined;
  }
  return fixtureIdByTeamPair.get(teamPairKey(homeTeamId, awayTeamId));
}

function slotAcceptsTeam(slot: BracketSlotRef, teamId: TeamId): boolean {
  if (slot.kind === "group-winner" || slot.kind === "group-runner-up") {
    return getGroupById(slot.groupId)?.teamIds.includes(teamId) ?? false;
  }
  if (slot.kind === "third-place") {
    return slot.groups.some(
      (groupId) => getGroupById(groupId)?.teamIds.includes(teamId) ?? false,
    );
  }
  return false;
}

/**
 * Map API teams to a round-of-32 slot via FIFA feeder groups (not standings).
 * Picks the closest scheduled kickoff when multiple templates match.
 */
export function findFixtureIdByKnockoutFeederGroups(
  homeName: string,
  awayName: string,
  apiKickoffUtc?: string,
): string | undefined {
  const apiHome = resolveTeamId(homeName);
  const apiAway = resolveTeamId(awayName);
  if (!apiHome || !apiAway) {
    return undefined;
  }

  const apiKickoffMs = apiKickoffUtc ? Date.parse(apiKickoffUtc) : Number.NaN;
  const kickoffAware = Number.isFinite(apiKickoffMs);

  type Candidate = { id: string; aligned: boolean; delta: number };
  const candidates: Candidate[] = [];

  for (const template of FIFA_ROUND_OF_32_TEMPLATES) {
    const fixtureId = `fixture-${String(template.matchNumber).padStart(3, "0")}`;
    const aligned =
      slotAcceptsTeam(template.home, apiHome) &&
      slotAcceptsTeam(template.away, apiAway);
    const swapped =
      slotAcceptsTeam(template.home, apiAway) &&
      slotAcceptsTeam(template.away, apiHome);
    if (!aligned && !swapped) {
      continue;
    }

    const scheduledMs = fixtureKickoffMs.get(fixtureId);
    const delta =
      kickoffAware && scheduledMs !== undefined
        ? Math.abs(scheduledMs - apiKickoffMs)
        : Number.POSITIVE_INFINITY;

    candidates.push({ id: fixtureId, aligned, delta });
  }

  if (candidates.length === 0) {
    return undefined;
  }

  candidates.sort((left, right) => {
    if (left.aligned !== right.aligned) {
      return left.aligned ? -1 : 1;
    }
    return left.delta - right.delta;
  });

  const best = candidates[0];
  if (!kickoffAware) {
    return best.id;
  }
  if (best.delta <= KICKOFF_MATCH_TOLERANCE_MS) {
    return best.id;
  }
  if (candidates.length === 1) {
    return best.id;
  }
  return undefined;
}

/**
 * Disambiguate round-of-32 matches 75 vs 76 (groups C and F) using standings.
 * Only returns a slot when API teams match the computed participants.
 */
export function findFixtureIdByGroupsCfPair(
  homeName: string,
  awayName: string,
  fixtures: readonly EffectiveFixture[] = WC26_FIXTURES,
): string | undefined {
  const apiHome = resolveTeamId(homeName);
  const apiAway = resolveTeamId(awayName);
  if (!apiHome || !apiAway) {
    return undefined;
  }

  const cTeams = getGroupById("c")?.teamIds ?? [];
  const fTeams = getGroupById("f")?.teamIds ?? [];
  const inC = (teamId: TeamId) => cTeams.includes(teamId);
  const inF = (teamId: TeamId) => fTeams.includes(teamId);
  const isCfPair =
    (inC(apiHome) && inF(apiAway)) || (inC(apiAway) && inF(apiHome));
  if (!isCfPair) {
    return undefined;
  }

  const cRows = computeGroupStandings("c", fixtures).rows;
  const fRows = computeGroupStandings("f", fixtures).rows;
  if (cRows.length < 2 || fRows.length < 2) {
    return undefined;
  }

  const cWinner = cRows[0]?.teamId;
  const cRunner = cRows[1]?.teamId;
  const fWinner = fRows[0]?.teamId;
  const fRunner = fRows[1]?.teamId;
  if (!cWinner || !cRunner || !fWinner || !fRunner) {
    return undefined;
  }

  const apiSet = new Set([apiHome, apiAway]);
  if (apiSet.has(fWinner) && apiSet.has(cRunner)) {
    return "fixture-075";
  }
  if (apiSet.has(cWinner) && apiSet.has(fRunner)) {
    return "fixture-076";
  }

  return undefined;
}

/**
 * Resolve a knockout fixture id from API team names using bracket slots.
 * When several knockout slots share the same pairing, pick the closest kickoff.
 */
export function findFixtureIdByKnockoutTeams(
  homeName: string,
  awayName: string,
  fixtures: readonly EffectiveFixture[] = WC26_FIXTURES,
  apiKickoffUtc?: string,
): string | undefined {
  const apiHome = resolveTeamId(homeName);
  const apiAway = resolveTeamId(awayName);
  if (!apiHome || !apiAway) {
    return undefined;
  }

  const apiKickoffMs = apiKickoffUtc ? Date.parse(apiKickoffUtc) : Number.NaN;
  const kickoffAware = Number.isFinite(apiKickoffMs);

  let bestId: string | undefined;
  let bestDelta = Number.POSITIVE_INFINITY;

  for (const fixture of fixtures) {
    if (fixture.stage === "group" || fixture.matchNumber == null) {
      continue;
    }

    const home = resolveFixtureParticipant(fixture, "home", fixtures);
    const away = resolveFixtureParticipant(fixture, "away", fixtures);
    if (
      isKnockoutPlaceholderTeam(home.teamId) ||
      isKnockoutPlaceholderTeam(away.teamId)
    ) {
      continue;
    }

    const teamsMatch =
      (apiHome === home.teamId && apiAway === away.teamId) ||
      (apiHome === away.teamId && apiAway === home.teamId);
    if (!teamsMatch) {
      continue;
    }

    if (!kickoffAware) {
      return fixture.id;
    }

    const scheduledMs = fixtureKickoffMs.get(fixture.id);
    if (scheduledMs === undefined) {
      continue;
    }
    const delta = Math.abs(scheduledMs - apiKickoffMs);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestId = fixture.id;
    }
  }

  if (!bestId) {
    return undefined;
  }
  if (!kickoffAware) {
    return bestId;
  }
  return bestDelta <= KICKOFF_MATCH_TOLERANCE_MS ? bestId : undefined;
}

/** Fallback when API team names are TBD — match by kickoff time. */
export function findFixtureIdByKickoffUtc(kickoffUtc: string): string | undefined {
  const targetMs = Date.parse(kickoffUtc);
  if (!Number.isFinite(targetMs)) {
    return undefined;
  }

  let bestId: string | undefined;
  let bestDelta = Number.POSITIVE_INFINITY;

  for (const fixture of WC26_FIXTURES) {
    if (fixture.stage === "group") {
      continue;
    }
    const scheduledMs = fixtureKickoffMs.get(fixture.id);
    if (scheduledMs === undefined) {
      continue;
    }
    const delta = Math.abs(scheduledMs - targetMs);
    if (delta <= KICKOFF_MATCH_TOLERANCE_MS && delta < bestDelta) {
      bestDelta = delta;
      bestId = fixture.id;
    }
  }

  return bestId;
}

export function findFixtureIdByMatchNumber(
  matchNumber: number,
): string | undefined {
  return fixtureIdByMatchNumber.get(matchNumber);
}

/** Map api-football short status codes to overlay status strings. */
export function mapApiStatusShort(short: string): string | null {
  const normalized = short.trim().toUpperCase();
  // Not started / TBD — keep static schedule; do not overlay.
  if (normalized === "NS" || normalized === "TBD") {
    return null;
  }

  const mapped: Record<string, string> = {
    FT: "ft",
    AET: "aet",
    PEN: "pen",
    "1H": "1h",
    HT: "ht",
    "2H": "2h",
    ET: "et",
    BT: "et",
    P: "penalties",
    INT: "live",
    LIVE: "live",
    PST: "postponed",
    CANC: "cancelled",
    ABD: "cancelled",
    AWD: "cancelled",
    WO: "cancelled",
  };

  return mapped[normalized] ?? normalized.toLowerCase();
}

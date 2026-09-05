import { getFixtureById } from "@/data/wc26";
import { findFixtureIdByMatchNumber } from "@/lib/wc26-fixture-match";

/** API-Football round labels retained only for request validation compatibility. */
export const WC26_KNOCKOUT_API_ROUNDS = [
  "Round of 32",
  "Round of 16",
  "Quarter-finals",
  "Semi-finals",
  "3rd Place Final",
  "Final",
] as const;

export type Wc26KnockoutApiRound = (typeof WC26_KNOCKOUT_API_ROUNDS)[number];

export function isWc26KnockoutApiRound(
  value: string,
): value is Wc26KnockoutApiRound {
  return (WC26_KNOCKOUT_API_ROUNDS as readonly string[]).includes(value);
}

export type Wc26KnockoutApiFixture = {
  readonly apiFixtureId: number;
  readonly fixtureId: string;
  readonly matchNumber: number;
  readonly kickoffUtc: string;
  readonly round: string;
  readonly venueName: string | null;
  readonly venueCity: string | null;
  readonly homeTeam: string;
  readonly awayTeam: string;
};

export type Wc26KnockoutFetchLog = {
  readonly round: Wc26KnockoutApiRound;
  readonly url: string;
  readonly fixtureIds: readonly number[];
  readonly localFixtureIds: readonly string[];
  readonly responseCount: number;
};

/** WC26 is complete and archived. Never fetch knockout data from API-Football. */
export async function fetchWc26KnockoutRound(): Promise<{
  fixtures: Wc26KnockoutApiFixture[];
}> {
  console.info("[wc26/knockout-fixtures] archive mode: provider fetch disabled");
  return { fixtures: [] };
}

/** WC26 is complete and archived. Never fetch knockout data from API-Football. */
export async function fetchWc26KnockoutFixtures(): Promise<{
  fixtures: Wc26KnockoutApiFixture[];
}> {
  console.info("[wc26/knockout-fixtures] archive mode: provider fetch disabled");
  return { fixtures: [] };
}

/** Validate that a local fixture id is a knockout slot (73-104), not group stage. */
export function assertKnockoutFixtureId(fixtureId: string): boolean {
  const fixture = getFixtureById(fixtureId);
  if (!fixture) {
    return false;
  }
  return fixture.stage !== "group" && fixture.matchNumber >= 73;
}

/** Resolve local fixture id by official FIFA match number. */
export function resolveKnockoutFixtureIdByMatchNumber(
  matchNumber: number,
): string | undefined {
  if (matchNumber < 73 || matchNumber > 104) {
    return undefined;
  }
  return findFixtureIdByMatchNumber(matchNumber);
}

import { getFixtureById, getVenueById } from "@/data/wc26";
import { apiFootballFetch } from "@/lib/api-football/client";
import { ApiFootballAuthError } from "@/lib/api-football/errors";
import { isMissingApiKeyError } from "@/lib/server/wc26-api-football";
import {
  findFixtureIdByKickoffUtc,
  findFixtureIdByKnockoutTeamPairOverride,
  findFixtureIdByMatchNumber,
  findFixtureIdByTeamNames,
} from "@/lib/wc26-fixture-match";

const WC_LEAGUE = 1;
const WC_SEASON = 2026;

/** API-Football round labels for WC26 knockout phases. */
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

type ApiKnockoutFixtureRow = {
  fixture: {
    id: number;
    date: string;
    status: { short: string };
  };
  league: {
    round?: string;
  };
  teams: {
    home: { name: string };
    away: { name: string };
  };
  venue?: {
    name?: string | null;
    city?: string | null;
  };
};

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

function knockoutRoundQuery(round: Wc26KnockoutApiRound): string {
  const params = new URLSearchParams({
    league: String(WC_LEAGUE),
    season: String(WC_SEASON),
    round,
  });
  return `/fixtures?${params.toString()}`;
}

function mapApiRowToLocalFixture(
  row: ApiKnockoutFixtureRow,
): Wc26KnockoutApiFixture | null {
  const kickoffUtc = row.fixture.date;
  const byTeams = findFixtureIdByTeamNames(
    row.teams.home.name,
    row.teams.away.name,
  );
  const byOverride = findFixtureIdByKnockoutTeamPairOverride(
    row.teams.home.name,
    row.teams.away.name,
  );
  const byKickoff = findFixtureIdByKickoffUtc(kickoffUtc);
  const fixtureId = byTeams ?? byOverride ?? byKickoff;
  if (!fixtureId) {
    return null;
  }

  const fixture = getFixtureById(fixtureId);
  if (!fixture || fixture.stage === "group") {
    return null;
  }

  return {
    apiFixtureId: row.fixture.id,
    fixtureId,
    matchNumber: fixture.matchNumber,
    kickoffUtc,
    round: row.league.round ?? "",
    venueName: row.venue?.name ?? getVenueById(fixture.venueId)?.name ?? null,
    venueCity: row.venue?.city ?? getVenueById(fixture.venueId)?.city ?? null,
    homeTeam: row.teams.home.name,
    awayTeam: row.teams.away.name,
  };
}

async function fetchKnockoutRoundRaw(
  round: Wc26KnockoutApiRound,
): Promise<{ url: string; rows: ApiKnockoutFixtureRow[] }> {
  const url = knockoutRoundQuery(round);
  try {
    const { data } = await apiFootballFetch<ApiKnockoutFixtureRow[]>(url);
    return { url, rows: data };
  } catch (error) {
    if (
      error instanceof ApiFootballAuthError ||
      isMissingApiKeyError(error instanceof Error ? error.message : "")
    ) {
      return { url, rows: [] };
    }
    throw error;
  }
}

function logKnockoutFetch(entry: Wc26KnockoutFetchLog, rows: unknown): void {
  console.info("[wc26/knockout-fixtures] API URL:", entry.url);
  console.info("[wc26/knockout-fixtures] response JSON:", JSON.stringify(rows));
  console.info(
    "[wc26/knockout-fixtures] api fixture ids:",
    entry.fixtureIds.join(", ") || "(none)",
  );
  console.info(
    "[wc26/knockout-fixtures] local fixture ids:",
    entry.localFixtureIds.join(", ") || "(none)",
  );
}

/** Fetch one knockout round from API-Football with server-side logging only. */
export async function fetchWc26KnockoutRound(
  round: Wc26KnockoutApiRound,
): Promise<{
  fixtures: Wc26KnockoutApiFixture[];
}> {
  const { url, rows } = await fetchKnockoutRoundRaw(round);
  const fixtures = rows
    .map(mapApiRowToLocalFixture)
    .filter((row): row is Wc26KnockoutApiFixture => row !== null)
    .sort((a, b) => a.matchNumber - b.matchNumber);

  const log: Wc26KnockoutFetchLog = {
    round,
    url,
    fixtureIds: rows.map((row) => row.fixture.id),
    localFixtureIds: fixtures.map((row) => row.fixtureId),
    responseCount: rows.length,
  };

  // Diagnostics stay on the server — never returned on the public API (BE-011).
  logKnockoutFetch(log, rows);

  return { fixtures };
}

/** Fetch all knockout rounds (73–104) from API-Football. */
export async function fetchWc26KnockoutFixtures(): Promise<{
  fixtures: Wc26KnockoutApiFixture[];
}> {
  const byFixtureId = new Map<string, Wc26KnockoutApiFixture>();

  for (const round of WC26_KNOCKOUT_API_ROUNDS) {
    const { fixtures } = await fetchWc26KnockoutRound(round);
    for (const fixture of fixtures) {
      const existing = byFixtureId.get(fixture.fixtureId);
      if (!existing || existing.matchNumber > fixture.matchNumber) {
        byFixtureId.set(fixture.fixtureId, fixture);
      }
    }
  }

  const fixtures = [...byFixtureId.values()].sort(
    (a, b) => a.matchNumber - b.matchNumber,
  );

  // Fallback: date-range fetch when round-specific queries return nothing.
  if (fixtures.length === 0) {
    const fallbackUrl = `/fixtures?league=${WC_LEAGUE}&season=${WC_SEASON}&from=2026-06-28&to=2026-07-19`;
    console.info("[wc26/knockout-fixtures] fallback API URL:", fallbackUrl);
    try {
      const { data } = await apiFootballFetch<ApiKnockoutFixtureRow[]>(
        fallbackUrl,
      );
      console.info(
        "[wc26/knockout-fixtures] fallback response JSON:",
        JSON.stringify(data),
      );
      const mapped = data
        .map(mapApiRowToLocalFixture)
        .filter((row): row is Wc26KnockoutApiFixture => row !== null)
        .sort((a, b) => a.matchNumber - b.matchNumber);
      console.info(
        "[wc26/knockout-fixtures] fallback api fixture ids:",
        data.map((row) => row.fixture.id).join(", ") || "(none)",
      );
      console.info(
        "[wc26/knockout-fixtures] fallback local fixture ids:",
        mapped.map((row) => row.fixtureId).join(", ") || "(none)",
      );
      return { fixtures: mapped };
    } catch (error) {
      const message = error instanceof Error ? error.message : "fallback failed";
      console.warn("[wc26/knockout-fixtures] fallback fetch failed:", message);
    }
  }

  return { fixtures };
}

/** Validate that a local fixture id is a knockout slot (73–104), not group stage. */
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
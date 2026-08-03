import {
  fetchDomesticLeagueFixtures,
  fetchDomesticLeagueStandings,
  domesticFixturesCacheControl,
  domesticStandingsCacheControl,
} from "@/lib/domestic-league/fetch";
import type {
  DomesticLeagueConfig,
  DomesticLeagueFixturesResponse,
  DomesticLeagueStandingsResponse,
} from "@/lib/domestic-league/types";
import {
  LALIGA_FIXTURES_CACHE_ACTIVE,
  LALIGA_FIXTURES_CACHE_PRESEASON,
  LALIGA_LEAGUE_ID,
  LALIGA_LEAGUE_NAME,
  LALIGA_SEASON,
  LALIGA_STANDINGS_CACHE_ACTIVE,
  LALIGA_STANDINGS_CACHE_PRESEASON,
} from "@/lib/la-liga/constants";

const CONFIG: DomesticLeagueConfig = {
  leagueId: LALIGA_LEAGUE_ID,
  leagueName: LALIGA_LEAGUE_NAME,
  season: LALIGA_SEASON,
  fixturesCacheActive: LALIGA_FIXTURES_CACHE_ACTIVE,
  fixturesCacheEmpty: LALIGA_FIXTURES_CACHE_PRESEASON,
  standingsCacheActive: LALIGA_STANDINGS_CACHE_ACTIVE,
  standingsCacheEmpty: LALIGA_STANDINGS_CACHE_PRESEASON,
};

export async function fetchLaLigaFixtures(): Promise<DomesticLeagueFixturesResponse> {
  return fetchDomesticLeagueFixtures(CONFIG);
}

export async function fetchLaLigaStandings(): Promise<DomesticLeagueStandingsResponse> {
  return fetchDomesticLeagueStandings(CONFIG);
}

export function laLigaFixturesCacheControl(
  body: DomesticLeagueFixturesResponse,
): string {
  return domesticFixturesCacheControl(CONFIG, body);
}

export function laLigaStandingsCacheControl(
  body: DomesticLeagueStandingsResponse,
): string {
  return domesticStandingsCacheControl(CONFIG, body);
}

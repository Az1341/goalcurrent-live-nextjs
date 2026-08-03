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
  BUNDESLIGA_FIXTURES_CACHE_ACTIVE,
  BUNDESLIGA_FIXTURES_CACHE_PRESEASON,
  BUNDESLIGA_LEAGUE_ID,
  BUNDESLIGA_LEAGUE_NAME,
  BUNDESLIGA_SEASON,
  BUNDESLIGA_STANDINGS_CACHE_ACTIVE,
  BUNDESLIGA_STANDINGS_CACHE_PRESEASON,
} from "@/lib/bundesliga/constants";

const CONFIG: DomesticLeagueConfig = {
  leagueId: BUNDESLIGA_LEAGUE_ID,
  leagueName: BUNDESLIGA_LEAGUE_NAME,
  season: BUNDESLIGA_SEASON,
  fixturesCacheActive: BUNDESLIGA_FIXTURES_CACHE_ACTIVE,
  fixturesCacheEmpty: BUNDESLIGA_FIXTURES_CACHE_PRESEASON,
  standingsCacheActive: BUNDESLIGA_STANDINGS_CACHE_ACTIVE,
  standingsCacheEmpty: BUNDESLIGA_STANDINGS_CACHE_PRESEASON,
};

export async function fetchBundesligaFixtures(): Promise<DomesticLeagueFixturesResponse> {
  return fetchDomesticLeagueFixtures(CONFIG);
}

export async function fetchBundesligaStandings(): Promise<DomesticLeagueStandingsResponse> {
  return fetchDomesticLeagueStandings(CONFIG);
}

export function bundesligaFixturesCacheControl(
  body: DomesticLeagueFixturesResponse,
): string {
  return domesticFixturesCacheControl(CONFIG, body);
}

export function bundesligaStandingsCacheControl(
  body: DomesticLeagueStandingsResponse,
): string {
  return domesticStandingsCacheControl(CONFIG, body);
}

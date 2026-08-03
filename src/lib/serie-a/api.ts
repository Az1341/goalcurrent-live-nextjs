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
  SERIEA_FIXTURES_CACHE_ACTIVE,
  SERIEA_FIXTURES_CACHE_PRESEASON,
  SERIEA_LEAGUE_ID,
  SERIEA_LEAGUE_NAME,
  SERIEA_SEASON,
  SERIEA_STANDINGS_CACHE_ACTIVE,
  SERIEA_STANDINGS_CACHE_PRESEASON,
} from "@/lib/serie-a/constants";

const CONFIG: DomesticLeagueConfig = {
  leagueId: SERIEA_LEAGUE_ID,
  leagueName: SERIEA_LEAGUE_NAME,
  season: SERIEA_SEASON,
  fixturesCacheActive: SERIEA_FIXTURES_CACHE_ACTIVE,
  fixturesCacheEmpty: SERIEA_FIXTURES_CACHE_PRESEASON,
  standingsCacheActive: SERIEA_STANDINGS_CACHE_ACTIVE,
  standingsCacheEmpty: SERIEA_STANDINGS_CACHE_PRESEASON,
};

export async function fetchSerieAFixtures(): Promise<DomesticLeagueFixturesResponse> {
  return fetchDomesticLeagueFixtures(CONFIG);
}

export async function fetchSerieAStandings(): Promise<DomesticLeagueStandingsResponse> {
  return fetchDomesticLeagueStandings(CONFIG);
}

export function serieAFixturesCacheControl(
  body: DomesticLeagueFixturesResponse,
): string {
  return domesticFixturesCacheControl(CONFIG, body);
}

export function serieAStandingsCacheControl(
  body: DomesticLeagueStandingsResponse,
): string {
  return domesticStandingsCacheControl(CONFIG, body);
}

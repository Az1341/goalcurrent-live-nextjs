import type { PlFixtureRow, PlStandingRow } from "@/lib/pl/types";

export type DomesticLeagueSource = "api-football" | "fallback";

export type DomesticLeagueFixturesResponse = {
  configured: boolean;
  league: string;
  leagueId: number;
  season: number;
  fixtures: PlFixtureRow[];
  source: DomesticLeagueSource;
  fetchedAt: string;
  error?: string;
  errorCode?: import("@/lib/api-football/errors").ApiFootballErrorCode;
  stale?: boolean;
};

export type DomesticLeagueStandingsResponse = {
  configured: boolean;
  league: string;
  leagueId: number;
  season: number;
  standings: PlStandingRow[];
  source: DomesticLeagueSource;
  fetchedAt: string;
  error?: string;
  errorCode?: import("@/lib/api-football/errors").ApiFootballErrorCode;
  stale?: boolean;
};

export type DomesticLeagueConfig = {
  leagueId: number;
  leagueName: string;
  season: number;
  fixturesCacheActive: number;
  fixturesCacheEmpty: number;
  standingsCacheActive: number;
  standingsCacheEmpty: number;
};

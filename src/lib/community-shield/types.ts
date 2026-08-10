import {
  COMMUNITY_SHIELD_COMPETITION,
  COMMUNITY_SHIELD_SEASON,
} from "@/lib/community-shield/constants";

export type CommunityShieldFixtureStatus =
  | "UPCOMING"
  | "LIVE"
  | "FT"
  | "POSTPONED"
  | "CANCELLED";

/** PlFixtureRow-shaped row with nullable kickoff (TBC) and broadcaster. */
export type CommunityShieldFixtureRow = {
  fixtureId: number;
  kickoffUtc: string | null;
  matchweek: number | null;
  round: string | null;
  venue: string | null;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamLogo: string | null;
  status: CommunityShieldFixtureStatus;
  statusShort: string;
  elapsed: number | null;
  homeScore: number | null;
  awayScore: number | null;
  broadcaster: string | null;
};

export type CommunityShieldFixturesApiResponse = {
  configured: boolean;
  competition: typeof COMMUNITY_SHIELD_COMPETITION;
  season: typeof COMMUNITY_SHIELD_SEASON;
  fixtures: CommunityShieldFixtureRow[];
  source: "fallback";
  fetchedAt: string;
  error?: string;
};

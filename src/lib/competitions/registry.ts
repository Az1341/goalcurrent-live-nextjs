/**
 * Central competition configuration (GC-COMP-UCL-SPRINT-001).
 * Single registry of identity / routes / sections — does not fork PL or WC26 data stacks.
 */

import { PL_LEAGUE_ID, PL_SEASON } from "@/lib/pl/constants";
import { WC26_API_LEAGUE_ID, WC26_API_SEASON } from "@/lib/server/wc26-api-fixture-id";
import {
  UCL_COMPETITION_TYPE,
  UCL_DISPLAY_NAME,
  UCL_INTERNAL_KEY,
  UCL_LEAGUE_ID,
  UCL_NAV_LABEL,
  UCL_SEASON,
  UCL_SHORT_NAME,
  UCL_SLUG,
  UCL_SUPPORTED_SECTIONS,
} from "@/lib/ucl/constants";

export type CompetitionKey = "pl" | "wc26" | "ucl";

export type CompetitionSection =
  | "hub"
  | "fixtures"
  | "results"
  | "standings"
  | "match";

export type CompetitionConfig = {
  key: CompetitionKey;
  slug: string;
  displayName: string;
  shortName: string;
  providerLeagueId: number;
  activeSeason: number;
  competitionType: "league" | "cup" | "tournament";
  supportedSections: readonly CompetitionSection[];
  navigationLabel: string;
  hubPath: string;
  metadata: {
    title: string;
    description: string;
    ogType: "website";
  };
  matchPathPrefix: string | null;
};

export const COMPETITIONS: Record<CompetitionKey, CompetitionConfig> = {
  pl: {
    key: "pl",
    slug: "premier-league",
    displayName: "Premier League",
    shortName: "PL",
    providerLeagueId: PL_LEAGUE_ID,
    activeSeason: PL_SEASON,
    competitionType: "league",
    supportedSections: ["hub", "fixtures", "results", "standings", "match"],
    navigationLabel: "Premier League",
    hubPath: "/premier-league",
    metadata: {
      title: "Premier League 2026/27",
      description: "Premier League fixtures, results and standings on GoalCurrent.",
      ogType: "website",
    },
    matchPathPrefix: "/premier-league/match",
  },
  wc26: {
    key: "wc26",
    slug: "worldcup2026",
    displayName: "FIFA World Cup 2026",
    shortName: "WC26",
    providerLeagueId: WC26_API_LEAGUE_ID,
    activeSeason: WC26_API_SEASON,
    competitionType: "tournament",
    supportedSections: ["hub", "fixtures", "results", "standings", "match"],
    navigationLabel: "WC26 Archive",
    hubPath: "/worldcup2026",
    metadata: {
      title: "World Cup 2026",
      description: "FIFA World Cup 2026 archive hub on GoalCurrent.",
      ogType: "website",
    },
    matchPathPrefix: "/match",
  },
  ucl: {
    key: UCL_INTERNAL_KEY,
    slug: UCL_SLUG,
    displayName: UCL_DISPLAY_NAME,
    shortName: UCL_SHORT_NAME,
    providerLeagueId: UCL_LEAGUE_ID,
    activeSeason: UCL_SEASON,
    competitionType: UCL_COMPETITION_TYPE,
    supportedSections: UCL_SUPPORTED_SECTIONS,
    navigationLabel: UCL_NAV_LABEL,
    hubPath: `/${UCL_SLUG}`,
    metadata: {
      title: "UEFA Champions League",
      description:
        "UEFA Champions League fixtures, results and league-phase standings on GoalCurrent.",
      ogType: "website",
    },
    matchPathPrefix: null,
  },
};

export function getCompetition(key: CompetitionKey): CompetitionConfig {
  return COMPETITIONS[key];
}

export function getCompetitionBySlug(slug: string): CompetitionConfig | null {
  const normalised = slug.replace(/^\/+|\/+$/g, "").toLowerCase();
  for (const config of Object.values(COMPETITIONS)) {
    if (config.slug === normalised) return config;
  }
  return null;
}

export function resolveCompetitionHubPath(key: CompetitionKey): string {
  return COMPETITIONS[key].hubPath;
}

export function competitionsShareProviderIdentity(
  a: CompetitionKey,
  b: CompetitionKey,
): boolean {
  const left = COMPETITIONS[a];
  const right = COMPETITIONS[b];
  return (
    left.providerLeagueId === right.providerLeagueId &&
    left.activeSeason === right.activeSeason
  );
}
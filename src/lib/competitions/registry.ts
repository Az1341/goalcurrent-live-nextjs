/**
 * Central competition configuration.
 * Single registry of identity / routes / sections — does not fork PL or WC26 data stacks.
 */

import { PL_LEAGUE_ID, PL_SEASON } from "@/lib/pl/constants";
import { isWc26TournamentComplete } from "@/lib/wc26/archive";
import {
  FACUP_COMPETITION_TYPE,
  FACUP_DATASETS,
  FACUP_DISPLAY_NAME,
  FACUP_INTERNAL_KEY,
  FACUP_LEAGUE_ID,
  FACUP_NAV_LABEL,
  FACUP_SEASON,
  FACUP_SHORT_NAME,
  FACUP_SLUG,
  FACUP_SUPPORTED_SECTIONS,
} from "@/lib/facup/constants";
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
import {
  UNL_COMPETITION_TYPE,
  UNL_DISPLAY_NAME,
  UNL_HUB_PATH,
  UNL_INTERNAL_KEY,
  UNL_LEAGUE_ID,
  UNL_NAV_LABEL,
  UNL_SEASON,
  UNL_SHORT_NAME,
  UNL_SLUG,
  UNL_SUPPORTED_SECTIONS,
} from "@/lib/unl/constants";

export type CompetitionKey = "pl" | "wc26" | "ucl" | "facup" | "unl";

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
  competitionType: "league" | "cup" | "tournament" | "knockout_cup";
  supportedSections: readonly CompetitionSection[];
  standingsSupported: boolean;
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
    displayName: "Premier League 26/27",
    shortName: "PL",
    providerLeagueId: PL_LEAGUE_ID,
    activeSeason: PL_SEASON,
    competitionType: "league",
    supportedSections: ["hub", "fixtures", "results", "standings", "match"],
    standingsSupported: true,
    navigationLabel: "PL 26/27",
    hubPath: "/premier-league",
    metadata: {
      title: "Premier League 26/27",
      description: "Premier League 26/27 fixtures, results and standings on GoalCurrent.",
      ogType: "website",
    },
    matchPathPrefix: "/premier-league/match",
  },
  wc26: {
    key: "wc26",
    slug: "worldcup2026",
    displayName: "FIFA World Cup 2026",
    shortName: "WC26",
    providerLeagueId: 1,
    activeSeason: 2026,
    competitionType: "tournament",
    supportedSections: ["hub", "fixtures", "results", "standings", "match"],
    standingsSupported: true,
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
    standingsSupported: true,
    navigationLabel: UCL_NAV_LABEL,
    hubPath: `/${UCL_SLUG}`,
    metadata: {
      title: "UEFA Champions League 26/27",
      description:
        "UEFA Champions League 26/27 fixtures, results and league-phase standings on GoalCurrent.",
      ogType: "website",
    },
    matchPathPrefix: null,
  },
  facup: {
    key: FACUP_INTERNAL_KEY,
    slug: FACUP_SLUG,
    displayName: FACUP_DISPLAY_NAME,
    shortName: FACUP_SHORT_NAME,
    providerLeagueId: FACUP_LEAGUE_ID,
    activeSeason: FACUP_SEASON,
    competitionType: FACUP_COMPETITION_TYPE,
    supportedSections: FACUP_SUPPORTED_SECTIONS,
    standingsSupported: FACUP_DATASETS.standings,
    navigationLabel: FACUP_NAV_LABEL,
    hubPath: `/${FACUP_SLUG}`,
    metadata: {
      title: "FA Cup 26/27",
      description:
        "FA Cup 26/27 fixtures and results on GoalCurrent — knockout rounds without standings tables.",
      ogType: "website",
    },
    matchPathPrefix: null,
  },
  unl: {
    key: UNL_INTERNAL_KEY,
    slug: UNL_SLUG,
    displayName: UNL_DISPLAY_NAME,
    shortName: UNL_SHORT_NAME,
    providerLeagueId: UNL_LEAGUE_ID,
    activeSeason: UNL_SEASON,
    competitionType: UNL_COMPETITION_TYPE,
    supportedSections: UNL_SUPPORTED_SECTIONS,
    standingsSupported: true,
    navigationLabel: UNL_NAV_LABEL,
    hubPath: UNL_HUB_PATH,
    metadata: {
      title: "UEFA Nations League 26/27",
      description:
        "UEFA Nations League 26/27 fixtures, results and group standings on GoalCurrent.",
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

export function competitionSupportsStandings(key: CompetitionKey): boolean {
  return COMPETITIONS[key].standingsSupported;
}

/** Current site lead competition — PL after WC26 archive completion. */
export function getSiteLeadCompetition(): CompetitionKey {
  return isWc26TournamentComplete() ? "pl" : "wc26";
}
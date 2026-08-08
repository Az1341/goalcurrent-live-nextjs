/**
 * Static routes for sitemap.xml.
 * Excludes noindex coming-soon stubs (see NOINDEX_STUB_PATHS).
 */

/** robots:noindex stubs — built for nav but omitted from sitemap until content ships. */
export const NOINDEX_STUB_PATHS = [
  "/statistics/assists",
  "/statistics/clean-sheets",
  "/statistics/disciplinary",
  "/statistics/live",
  "/statistics/player-rankings",
  "/statistics/players",
  "/statistics/teams",
  "/statistics/top-scorers",
  "/transfers",
  "/transfers/rumours",
  "/transfers/completed",
  "/transfers/free-agents",
  "/favourites",
  "/favourites/clubs",
  "/favourites/players",
  "/worldcup2026/players",
  "/news/transfers",
] as const;

/** Indexable static routes (exclude redirect sources such as /video/*). */
export const SITEMAP_STATIC_PATHS = [
  "/",
  "/live",
  "/news",
  "/news/world-cup",
  "/news/premier-league",
  "/articles",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/cookies",
  "/affiliate-disclosure",
  "/worldcup2026",
  "/worldcup2026/groups",
  "/worldcup2026/fixtures",
  "/worldcup2026/standings",
  "/worldcup2026/teams",
  "/worldcup2026/venues",
  "/worldcup2026/bracket",
  "/premier-league",
  "/premier-league/table",
  "/premier-league/2025-26/table",
  "/premier-league/fixtures",
  "/premier-league/live",
  "/premier-league/clubs",
  "/premier-league/players",
  "/premier-league/statistics",
  "/premier-league/transfers",
  "/fixture",
  "/champions-league",
  "/fa-cup",
  "/nations-league",
  "/videos",
  "/videos/premier-league",
  "/videos/world-cup",
] as const;
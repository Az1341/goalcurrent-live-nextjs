export type NavItem = {
  href: string;
  labelKey: string;
  icon?: string;
  exact?: boolean;
};

export type NavLinkItem = {
  href: string;
  labelKey: string;
  external?: boolean;
};

export type MobileBottomTab = {
  id: string;
  href: string;
  labelKey: string;
  exact?: boolean;
};

export type MoreSheetSubmenuId =
  | "language"
  | "wc26"
  | "pl"
  | "clubs"
  | "players"
  | "tables"
  | "statistics"
  | "news"
  | "video"
  | "transfers";

export type MoreSheetLevel1Item =
  | { type: "submenu"; id: MoreSheetSubmenuId; labelKey: string }
  | { type: "divider" }
  | { type: "link"; href: string; labelKey: string; external?: boolean };

export type DesktopDropdownSection = {
  titleKey: string;
  links: NavLinkItem[];
};

/** Global favourites Ã¢â‚¬â€ saved items across all competitions. */
export const FAVOURITES_HREF = "/favourites";

/** Desktop primary links (before dropdowns). */
export const DESKTOP_PRIMARY_NAV: NavItem[] = [
  { href: "/", labelKey: "home", exact: true },
  { href: "/live", labelKey: "live" },
  { href: FAVOURITES_HREF, labelKey: "favourites" },
  { href: "/news", labelKey: "news" },
  { href: "/articles", labelKey: "articles" },
  { href: "/videos", labelKey: "videos" },
];

/** Legacy / footer Ã¢â‚¬â€ full primary list for other consumers. */
export const MAIN_NAV: NavItem[] = [
  ...DESKTOP_PRIMARY_NAV,
  { href: "/premier-league", labelKey: "premierLeague", exact: true },
];

/** Premier League 2026/27 section links */
export const PL_NAV: NavItem[] = [
  { href: "/premier-league/table", labelKey: "table" },
  { href: "/premier-league/fixtures", labelKey: "fixtures" },
];

/** Premier League hub Ã¢â‚¬â€ extended section links */
export const PL_SECTION_NAV: NavItem[] = [
  { href: "/premier-league/table", labelKey: "table2627" },
  { href: "/premier-league/fixtures", labelKey: "fixtures2627" },
  { href: "/premier-league/clubs", labelKey: "clubs" },
  { href: "/premier-league/players", labelKey: "players" },
  { href: "/premier-league/statistics", labelKey: "statistics" },
  { href: "/premier-league/transfers", labelKey: "transfers" },
];

/** World Cup 2026 section links */
export const WC26_NAV: NavItem[] = [
  { href: "/worldcup2026/groups", labelKey: "groups" },
  { href: "/worldcup2026/fixtures", labelKey: "fixtures" },
  { href: "/worldcup2026/standings", labelKey: "standings" },
  { href: "/worldcup2026/teams", labelKey: "teams" },
  { href: "/worldcup2026/venues", labelKey: "venues" },
  { href: "/worldcup2026/bracket", labelKey: "bracket" },
];

/** More dropdown Ã¢â‚¬â€ WC26 hub + section links (legacy) */
export const MORE_NAV: NavLinkItem[] = [
  { href: "/worldcup2026", labelKey: "overview" },
  ...WC26_NAV,
];

/** Mobile bottom tab bar Ã¢â‚¬â€ primary tabs only (<769px) */
export const MOBILE_BOTTOM_TABS: MobileBottomTab[] = [
  { id: "home", href: "/", labelKey: "home", exact: true },
  { id: "live", href: "/live", labelKey: "live" },
  { id: "favourites", href: FAVOURITES_HREF, labelKey: "favourites" },
  { id: "pl", href: "/premier-league", labelKey: "pl2627" },
  { id: "articles", href: "/articles", labelKey: "articles" },
];

/** More bottom sheet â€” level 1 categories + site footer links */
export const MORE_SHEET_LEVEL1: MoreSheetLevel1Item[] = [
  { type: "submenu", id: "language", labelKey: "language" },
  { type: "link", href: "/articles", labelKey: "articlesEditorial" },
  { type: "submenu", id: "wc26", labelKey: "wc26" },
  { type: "submenu", id: "pl", labelKey: "pl2627" },
  { type: "link", href: "/champions-league", labelKey: "championsLeague" },
  { type: "link", href: "/fa-cup", labelKey: "faCup" },
  { type: "submenu", id: "clubs", labelKey: "clubs" },
  { type: "submenu", id: "players", labelKey: "players" },
  { type: "submenu", id: "tables", labelKey: "table" },
  { type: "submenu", id: "news", labelKey: "news" },
  { type: "submenu", id: "video", labelKey: "videoAudio" },
  { type: "divider" },
  { type: "link", href: "/about", labelKey: "about" },
  { type: "link", href: "/contact", labelKey: "contact" },
  { type: "link", href: "/terms", labelKey: "terms" },
  { type: "link", href: "/privacy", labelKey: "privacy" },
  { type: "link", href: "/cookies", labelKey: "cookies" },
  { type: "link", href: "/affiliate-disclosure", labelKey: "affiliateDisclosure" },
];

/** More bottom sheet â€” level 2 drill-down links */
export const MORE_SHEET_SUBMENUS: Record<MoreSheetSubmenuId, NavLinkItem[]> = {
  language: [],
  wc26: [
    { href: "/worldcup2026", labelKey: "overview" },
    { href: "/worldcup2026/fixtures", labelKey: "fixtures" },
    { href: "/worldcup2026/standings", labelKey: "standings" },
    { href: "/worldcup2026/groups", labelKey: "groups" },
    { href: "/worldcup2026/teams", labelKey: "teams" },
    { href: "/worldcup2026/venues", labelKey: "venues" },
    { href: "/worldcup2026/bracket", labelKey: "bracket" },
    { href: "/news/world-cup", labelKey: "news" },
    { href: "/videos/world-cup", labelKey: "wcVideos" },
  ],
  pl: [
    { href: "/premier-league", labelKey: "home" },
    { href: "/premier-league/fixtures", labelKey: "fixtures" },
    { href: "/premier-league/live", labelKey: "liveMatches" },
    { href: "/premier-league/table", labelKey: "table" },
    { href: "/premier-league/clubs", labelKey: "clubs" },
    { href: "/premier-league/players", labelKey: "players" },
    { href: "/premier-league/statistics", labelKey: "statistics" },
    { href: "/premier-league/transfers", labelKey: "transfers" },
    { href: "/news/premier-league", labelKey: "news" },
    { href: "/videos/premier-league", labelKey: "plVideos" },
  ],
  clubs: [
    { href: "/premier-league/clubs", labelKey: "plClubs" },
    { href: "/worldcup2026/teams", labelKey: "worldCupTeams" },
  ],
  players: [
    { href: "/premier-league/players", labelKey: "plPlayers" },
  ],
  tables: [
    { href: "/premier-league/table", labelKey: "plTable2627" },
    { href: "/worldcup2026/groups", labelKey: "wc26GroupTables" },
    { href: "/worldcup2026/bracket", labelKey: "wc26Bracket" },
  ],
  statistics: [],
  news: [
    { href: "/news", labelKey: "latestNews" },
    { href: "/articles", labelKey: "editorialArticles" },
    { href: "/news/world-cup", labelKey: "worldCupNews" },
    { href: "/news/premier-league", labelKey: "premierLeagueNews" },
  ],
  video: [
    { href: "/videos", labelKey: "latestVideos" },
    { href: "/videos/premier-league", labelKey: "plVideos" },
    { href: "/videos/world-cup", labelKey: "wcVideos" },
  ],
  transfers: [],
};

export const MORE_SHEET_SUBMENU_TITLE_KEYS: Record<MoreSheetSubmenuId, string> = {
  language: "language",
  wc26: "wc26",
  pl: "pl2627",
  clubs: "clubs",
  players: "players",
  tables: "table",
  statistics: "statistics",
  news: "news",
  video: "videoAudio",
  transfers: "transfers",
};

/** Desktop PL 26/27 header dropdown Ã¢â‚¬â€ existing routes only */
export const DESKTOP_PL_DROPDOWN: NavLinkItem[] = [
  { href: "/premier-league", labelKey: "plHome" },
  { href: "/premier-league/fixtures", labelKey: "fixtures" },
  { href: "/premier-league/table", labelKey: "table" },
  { href: "/premier-league/clubs", labelKey: "clubs" },
  { href: "/premier-league/statistics", labelKey: "statistics" },
];

/** Archive links for More sheet Ã¢â‚¬â€ not a live competition dropdown. */
export const DESKTOP_WC26_DROPDOWN: NavLinkItem[] = [
  { href: "/worldcup2026", labelKey: "wc26Home" },
  { href: "/worldcup2026/bracket", labelKey: "bracket" },
  { href: "/worldcup2026/fixtures", labelKey: "fixtures" },
  { href: "/worldcup2026/standings", labelKey: "standings" },
];

/** About and contact */
export const SITE_NAV: NavItem[] = [
  { href: "/about", labelKey: "about" },
  { href: "/contact", labelKey: "contact" },
];

/** Desktop top bar Ã¢â‚¬â€ all navigation links in one horizontal row */
export const TOP_NAV: NavItem[] = [
  ...MAIN_NAV,
  ...WC26_NAV,
  ...PL_NAV,
  ...SITE_NAV,
];

export const FOOTER_PLATFORM_LINKS: NavLinkItem[] = [
  { href: "/live", labelKey: "live" },
  { href: "/premier-league/table", labelKey: "table" },
  { href: "/articles", labelKey: "articles" },
  { href: "/worldcup2026", labelKey: "worldCup2026" },
];

export const FOOTER_COMPANY_LINKS: NavLinkItem[] = [
  { href: "/about", labelKey: "about" },
  { href: "/contact", labelKey: "contact" },
  { href: "/privacy", labelKey: "privacy" },
  { href: "/terms", labelKey: "terms" },
];

export const FOOTER_LINKS: NavLinkItem[] = [
  { href: "/about", labelKey: "about" },
  { href: "/contact", labelKey: "contact" },
  { href: "/terms", labelKey: "terms" },
  { href: "/privacy", labelKey: "privacy" },
  { href: "/cookies", labelKey: "cookies" },
  { href: "/affiliate-disclosure", labelKey: "affiliateDisclosure" },
];

export type SocialLinkItem = {
  href: string;
  labelKey: "facebook" | "instagram" | "tiktok" | "twitter";
  icon: "facebook" | "instagram" | "tiktok" | "twitter";
};

export const FOOTER_SOCIAL: SocialLinkItem[] = [
  {
    href: "https://www.facebook.com/people/Goalcurrentlive/61591562350580/",
    labelKey: "facebook",
    icon: "facebook",
  },
  {
    href: "https://www.instagram.com/goalcurrent.live/",
    labelKey: "instagram",
    icon: "instagram",
  },
  {
    href: "https://x.com/GoalCurrentlive",
    labelKey: "twitter",
    icon: "twitter",
  },
  {
    href: "https://www.tiktok.com/@goalcurrent.live",
    labelKey: "tiktok",
    icon: "tiktok",
  },
];

export function isNavActive(pathname: string, href: string, exact?: boolean) {
  if (exact || href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isMainNavActive(pathname: string, href: string, exact?: boolean) {
  return isNavActive(pathname, href, exact);
}

export function isDesktopPlActive(pathname: string): boolean {
  return pathname === "/premier-league" || pathname.startsWith("/premier-league/");
}

export function isDesktopWc26Active(pathname: string): boolean {
  return pathname === "/worldcup2026" || pathname.startsWith("/worldcup2026/");
}

export function isMobileBottomTabActive(
  pathname: string,
  tab: MobileBottomTab,
): boolean {
  if (tab.id === "home") {
    return pathname === "/";
  }

  if (tab.id === "live") {
    return pathname === "/live" || pathname.startsWith("/live/");
  }

  if (tab.id === "favourites") {
    return (
      pathname === FAVOURITES_HREF || pathname.startsWith(`${FAVOURITES_HREF}/`)
    );
  }

  if (tab.id === "pl") {
    return isDesktopPlActive(pathname);
  }

  if (tab.id === "wc26") {
    return isDesktopWc26Active(pathname);
  }

  return isNavActive(pathname, tab.href, tab.exact);
}

export function isMoreSheetLinkActive(pathname: string, href: string): boolean {
  const [path] = href.split("?");
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function shouldShowMobileBack(pathname: string): boolean {
  return pathname !== "/";
}

const MOBILE_BACK_PARENT_RULES: Array<{ match: RegExp; parent: string }> = [
  { match: /^\/match\/.+/, parent: "/worldcup2026/fixtures" },
  { match: /^\/premier-league\/match\/.+/, parent: "/premier-league/fixtures" },
  { match: /^\/worldcup2026\/match\/.+/, parent: "/worldcup2026/fixtures" },
  { match: /^\/worldcup2026\/groups\/[^/]+$/, parent: "/worldcup2026/groups" },
  { match: /^\/worldcup2026\/teams\/[^/]+$/, parent: "/worldcup2026/teams" },
  { match: /^\/premier-league\/clubs\/[^/]+$/, parent: "/premier-league/clubs" },
  { match: /^\/articles\/[^/]+$/, parent: "/articles" },
  { match: /^\/news\/articles\/[^/]+$/, parent: "/news/articles" },
  { match: /^\/news\/[^/]+$/, parent: "/news" },
  { match: /^\/videos\/[^/]+$/, parent: "/videos" },
  { match: /^\/video\/[^/]+$/, parent: "/video" },
  { match: /^\/statistics\/[^/]+$/, parent: "/statistics" },
  { match: /^\/transfers\/[^/]+$/, parent: "/transfers" },
  { match: /^\/favourites\/[^/]+$/, parent: "/favourites" },
  { match: /^\/premier-league\/2025-26\/[^/]+$/, parent: "/premier-league/table" },
];

export function getMobileBackFallback(pathname: string): string {
  for (const rule of MOBILE_BACK_PARENT_RULES) {
    if (rule.match.test(pathname)) {
      return rule.parent;
    }
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) {
    return "/";
  }

  segments.pop();
  return `/${segments.join("/")}`;
}

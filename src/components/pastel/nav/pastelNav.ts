/** Preview-only Pastel Pulse nav SSOT - not production src/lib/nav.ts. */

export type PastelNavId =
  | "home"
  | "scores"
  | "transfers"
  | "tables"
  | "news"
  | "favourites"
  | "videos"
  | "articles";

export type PastelNavItem = {
  id: PastelNavId;
  href: string;
  label: string;
};

export const PASTEL_NAV_ITEMS: Record<PastelNavId, PastelNavItem> = {
  home: { id: "home", href: "/", label: "Home" },
  scores: { id: "scores", href: "/live", label: "Scores" },
  transfers: { id: "transfers", href: "/transfers", label: "Transfers" },
  tables: { id: "tables", href: "/premier-league/table", label: "Tables" },
  news: { id: "news", href: "/news", label: "News" },
  favourites: { id: "favourites", href: "/favourites", label: "Favourites" },
  videos: { id: "videos", href: "/videos", label: "Videos" },
  articles: { id: "articles", href: "/articles", label: "Articles" },
};

export const PASTEL_DESKTOP_SIDEBAR: PastelNavId[] = [
  "home",
  "scores",
  "tables",
  "favourites",
];

export const PASTEL_DESKTOP_TOP: PastelNavId[] = [
  "transfers",
  "news",
  "videos",
  "articles",
];

export const PASTEL_TABLET_TOP: PastelNavId[] = [
  "home",
  "scores",
  "transfers",
  "tables",
  "news",
];

export const PASTEL_TABLET_MORE: PastelNavId[] = [
  "favourites",
  "videos",
  "articles",
];

export const PASTEL_MOBILE_TABS: PastelNavId[] = [
  "home",
  "scores",
  "favourites",
  "news",
];

export const PASTEL_MOBILE_MORE: PastelNavId[] = [
  "transfers",
  "tables",
  "videos",
  "articles",
];

export function resolvePastelItems(ids: PastelNavId[]): PastelNavItem[] {
  return ids.map((id) => PASTEL_NAV_ITEMS[id]);
}

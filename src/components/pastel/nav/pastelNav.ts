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
  /** Only Home is interactive in this preview scaffold. */
  enabled: boolean;
};

export const PASTEL_NAV_ITEMS: Record<PastelNavId, PastelNavItem> = {
  /** Stay inside the preview shell — do not link to production `/`. */
  home: { id: "home", href: "/preview-pastel", label: "Home", enabled: true },
  scores: { id: "scores", href: "/live", label: "Scores", enabled: false },
  transfers: {
    id: "transfers",
    href: "/transfers",
    label: "Transfers",
    enabled: false,
  },
  tables: {
    id: "tables",
    href: "/premier-league/table",
    label: "Tables",
    enabled: false,
  },
  news: { id: "news", href: "/news", label: "News", enabled: false },
  favourites: {
    id: "favourites",
    href: "/favourites",
    label: "Favourites",
    enabled: false,
  },
  videos: { id: "videos", href: "/videos", label: "Videos", enabled: false },
  articles: {
    id: "articles",
    href: "/articles",
    label: "Articles",
    enabled: false,
  },
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

/** Active-state helper for the Pastel preview shell (locale-stripped pathname). */
export function isPastelNavActive(
  pathname: string,
  href: string,
  exact?: boolean,
): boolean {
  if (exact || href === "/" || href === "/preview-pastel") {
    return (
      pathname === "/" ||
      pathname === "" ||
      pathname === "/preview-pastel"
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

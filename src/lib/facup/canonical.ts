import { FACUP_HUB_PATH, FACUP_SLUG } from "@/lib/facup/constants";
import { getCompetitionBySlug } from "@/lib/competitions/registry";

export function facupCanonicalPath(): string {
  return FACUP_HUB_PATH;
}

export function isFacupHubPath(pathname: string): boolean {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const withoutLocale = clean.replace(
    /^\/(en|fa|ar|fr|de|nl|es|pt|it)(?=\/|$)/,
    "",
  );
  const path = withoutLocale || "/";
  return path === FACUP_HUB_PATH || path === `/${FACUP_SLUG}`;
}

export function resolveFacupCanonicalFromSlug(slug: string): string | null {
  const config = getCompetitionBySlug(slug);
  if (!config || config.key !== "facup") return null;
  return config.hubPath;
}
import { UCL_HUB_PATH, UCL_SLUG } from "@/lib/ucl/constants";
import { getCompetitionBySlug } from "@/lib/competitions/registry";

/** Canonical English hub path — no duplicate slug variants. */
export function uclCanonicalPath(): string {
  return UCL_HUB_PATH;
}

export function isUclHubPath(pathname: string): boolean {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const withoutLocale = clean.replace(
    /^\/(en|fa|ar|fr|de|nl|es|pt|it)(?=\/|$)/,
    "",
  );
  const path = withoutLocale || "/";
  return path === UCL_HUB_PATH || path === `/${UCL_SLUG}`;
}

export function resolveUclCanonicalFromSlug(slug: string): string | null {
  const config = getCompetitionBySlug(slug);
  if (!config || config.key !== "ucl") return null;
  return config.hubPath;
}
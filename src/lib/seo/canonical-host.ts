import { SITE_DOMAIN } from "@/lib/site-url";

const REMOVED_LOCALE_PREFIX = /^\/(ar|fa)(?=\/|$)/i;

/**
 * Return the canonical apex URL only when a request arrives on the legacy
 * www hostname. Preview, localhost and Vercel hosts are intentionally ignored.
 */
export function canonicalHostRedirectUrl(input: URL): URL | null {
  if (input.hostname.toLowerCase() !== `www.${SITE_DOMAIN.toLowerCase()}`) {
    return null;
  }

  const target = new URL(input.toString());
  target.protocol = "https:";
  target.hostname = SITE_DOMAIN;
  target.port = "";
  return target;
}

/**
 * Arabic and Persian routes were removed from the supported locale set in
 * August 2026. Consolidate any stale indexed URLs to the equivalent English
 * route rather than leaving duplicate/404 locale paths in search indexes.
 */
export function removedLocaleRedirectPath(pathname: string): string | null {
  if (!REMOVED_LOCALE_PREFIX.test(pathname)) {
    return null;
  }

  const stripped = pathname.replace(REMOVED_LOCALE_PREFIX, "");
  return stripped.startsWith("/") ? stripped : stripped ? `/${stripped}` : "/";
}

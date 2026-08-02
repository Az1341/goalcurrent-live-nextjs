/** Remote hosts allowed for Next.js Image optimization (CDN-transformed). */
export const REMOTE_IMAGE_HOSTNAMES = [
  "media.api-sports.io",
  "i.ytimg.com",
  "img.youtube.com",
  "ichef.bbci.co.uk",
  "live-production.wcms.afd.news.bbc.co.uk",
  "a.espncdn.com",
  "a1.espncdn.com",
  "a2.espncdn.com",
  "a3.espncdn.com",
  "a4.espncdn.com",
  "i.guim.co.uk",
] as const;

export function isLocalImageSrc(src: string): boolean {
  return src.startsWith("/");
}

/** Decode HTML entities in remote image URLs (Guardian RSS uses &amp; in query strings). */
export function sanitizeRemoteImageUrl(src: string): string {
  return src
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Target width for news/card imagery — RSS feeds often ship 140–240px thumbs. */
export const NEWS_IMAGE_TARGET_WIDTH = 1000;
/** BBC ichef commonly supports up to 976 on /ace/standard/{n}/ paths. */
const BBC_IMAGE_TARGET_WIDTH = 976;

/**
 * Upgrade tiny CDN thumbnail URLs to card/hero-usable sizes.
 * Guardian media:thumbnail and BBC RSS thumbs are often 140–240px and blur when stretched.
 */
export function upgradeRemoteNewsImageUrl(src: string): string {
  const sanitized = sanitizeRemoteImageUrl(src);
  try {
    const url = new URL(sanitized);

    if (url.hostname === "i.guim.co.uk") {
      const current = Number(url.searchParams.get("width") || "0");
      if (!Number.isFinite(current) || current < NEWS_IMAGE_TARGET_WIDTH) {
        url.searchParams.set("width", String(NEWS_IMAGE_TARGET_WIDTH));
      }
      return url.toString();
    }

    if (url.hostname === "ichef.bbci.co.uk") {
      url.pathname = url.pathname
        .replace(
          /\/ace\/standard\/\d+\//i,
          `/ace/standard/${BBC_IMAGE_TARGET_WIDTH}/`,
        )
        .replace(/\/news\/\d+\//i, `/news/${BBC_IMAGE_TARGET_WIDTH}/`)
        .replace(
          /\/images\/ic\/\d+x\d+\//i,
          `/images/ic/${BBC_IMAGE_TARGET_WIDTH}x${Math.round((BBC_IMAGE_TARGET_WIDTH * 9) / 16)}/`,
        );
      return url.toString();
    }

    if (/\.espncdn\.com$/i.test(url.hostname)) {
      for (const key of ["w", "width"] as const) {
        if (!url.searchParams.has(key)) continue;
        const current = Number(url.searchParams.get(key) || "0");
        if (Number.isFinite(current) && current > 0 && current < NEWS_IMAGE_TARGET_WIDTH) {
          url.searchParams.set(key, String(NEWS_IMAGE_TARGET_WIDTH));
        }
      }
      return url.toString();
    }

    return url.toString();
  } catch {
    return sanitized;
  }
}

export function isSvgSrc(src: string): boolean {
  return src.split("?")[0]?.toLowerCase().endsWith(".svg") ?? false;
}

export function isOptimizableRemoteSrc(src: string): boolean {
  if (isLocalImageSrc(src)) {
    return !isSvgSrc(src);
  }

  try {
    const { hostname } = new URL(src);
    return (REMOTE_IMAGE_HOSTNAMES as readonly string[]).includes(hostname);
  } catch {
    return false;
  }
}

export function shouldUseUnoptimizedImage(src: string): boolean {
  if (isSvgSrc(src)) {
    return true;
  }

  if (isLocalImageSrc(src)) {
    return false;
  }

  return !isOptimizableRemoteSrc(src);
}

/** Append an SVG-specific class when `src` is local SVG card/banner art. */
export function withSvgMediaClass(
  src: string | null | undefined,
  baseClass: string,
  svgClass: string,
): string {
  return src && isSvgSrc(src) ? `${baseClass} ${svgClass}` : baseClass;
}

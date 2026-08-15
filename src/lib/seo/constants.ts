import { absoluteUrl } from "@/lib/site-url";

export const DEFAULT_OG_IMAGE_ALT =
  "GoalCurrent.live — live football scores, fixtures, results and news";

/**
 * Generic GoalCurrent brand image. Do not use competition-specific artwork here:
 * this is the site-wide fallback inherited by the homepage and generic pages.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/icons/icon-512.png",
  width: 512,
  height: 512,
  alt: DEFAULT_OG_IMAGE_ALT,
} as const;

export const DEFAULT_TWITTER_CARD = "summary_large_image" as const;

export const EDITORIAL_AUTHOR = "Ahmad Zafarani";
export const EDITORIAL_PUBLISHER = "GoalCurrent.live";

/** Display label for news cards and article source lines. */
export const EDITORIAL_SOURCE_LABEL = `${EDITORIAL_AUTHOR} · ${EDITORIAL_PUBLISHER}`;

/** Google News sitemap publication block. */
export const NEWS_PUBLICATION_NAME = "GoalCurrent.live";

export function defaultOgImageUrl(): string {
  return absoluteUrl(DEFAULT_OG_IMAGE.url);
}

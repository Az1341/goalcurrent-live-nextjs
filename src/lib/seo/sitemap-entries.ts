import type { MetadataRoute } from "next";
import {
  articleHref,
  ARTICLE_INDEX,
  getAllCanonicalArticleSlugs,
  getArticleBySlug,
} from "@/data/articles";
import { EDITORIAL_ARTICLES } from "@/data/editorial";
import { getAllClubSlugs } from "@/data/pl-clubs";
import {
  WC26_FIXTURES,
  WC26_GROUP_IDS,
  WC26_TEAMS,
} from "@/data/wc26";
import { routing } from "@/i18n/routing";
import { buildHreflangAlternates, localizedUrl } from "@/lib/i18n/urls";
import { groupHref } from "@/lib/wc26-groups";
import { matchHref } from "@/lib/wc26-match";
import { teamHref } from "@/lib/wc26-teams";
import { SITEMAP_STATIC_PATHS } from "@/lib/seo/sitemap-static-paths";

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = NonNullable<SitemapEntry["changeFrequency"]>;

export type SitemapPathSpec = {
  path: string;
  lastModified: Date;
  priority: number;
  changeFrequency: ChangeFrequency;
};

function parseArticleDate(date: string): Date {
  const iso = Date.parse(date);
  if (!Number.isNaN(iso)) {
    return new Date(iso);
  }
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function articleLastModified(slug: string, fallback: Date): Date {
  const article = getArticleBySlug(slug);
  if (article?.date) {
    return parseArticleDate(article.date);
  }
  const indexEntry = ARTICLE_INDEX.find((entry) => entry.slug === slug);
  if (indexEntry?.date) {
    return parseArticleDate(indexEntry.date);
  }
  return fallback;
}

function staticPriority(path: string): number {
  if (path === "/") return 1;
  if (path.startsWith("/worldcup2026") || path.startsWith("/match/")) return 0.9;
  if (path.startsWith("/premier-league")) return 0.85;
  if (path.startsWith("/articles") || path.startsWith("/news")) return 0.8;
  if (path === "/live") return 0.9;
  return 0.7;
}

function staticChangeFrequency(path: string): ChangeFrequency {
  if (path === "/" || path === "/live") return "hourly";
  if (path.startsWith("/statistics") || path.startsWith("/transfers")) {
    return "weekly";
  }
  return "daily";
}


function dedupeByUrl(entries: SitemapEntry[]): SitemapEntry[] {
  const byUrl = new Map<string, SitemapEntry>();
  for (const item of entries) {
    byUrl.set(item.url, item);
  }
  return [...byUrl.values()];
}

/** All indexable path patterns (one per logical page, locale-agnostic). */
export function collectSitemapPathSpecs(fallback: Date): SitemapPathSpec[] {
  const specs: SitemapPathSpec[] = [];

  for (const path of SITEMAP_STATIC_PATHS) {
    specs.push({
      path,
      lastModified: fallback,
      priority: staticPriority(path),
      changeFrequency: staticChangeFrequency(path),
    });
  }

  for (const groupId of WC26_GROUP_IDS) {
    const path = groupHref(groupId);
    specs.push({
      path,
      lastModified: fallback,
      priority: 0.85,
      changeFrequency: "weekly",
    });
  }

  for (const team of WC26_TEAMS) {
    specs.push({
      path: teamHref(team.id),
      lastModified: fallback,
      priority: 0.8,
      changeFrequency: "weekly",
    });
  }

  for (const fixture of WC26_FIXTURES) {
    // Canonical match URLs only — hub /worldcup2026/match/* redirects and must not be sitemapped.
    specs.push({
      path: matchHref(fixture.id),
      lastModified: new Date(fixture.kickoffUtc),
      priority: 0.8,
      changeFrequency: "daily",
    });
  }

  for (const slug of getAllClubSlugs()) {
    specs.push({
      path: `/premier-league/clubs/${slug}`,
      lastModified: fallback,
      priority: 0.8,
      changeFrequency: "weekly",
    });
  }

  const canonicalArticleSlugs = new Set(getAllCanonicalArticleSlugs());

  for (const slug of canonicalArticleSlugs) {
    const indexEntry = ARTICLE_INDEX.find((entry) => entry.slug === slug);
    specs.push({
      path: indexEntry?.href ?? articleHref(slug),
      lastModified: articleLastModified(slug, fallback),
      priority: 0.85,
      changeFrequency: "weekly",
    });
  }

  for (const article of EDITORIAL_ARTICLES) {
    if (canonicalArticleSlugs.has(article.slug)) {
      continue;
    }
    specs.push({
      path: article.path,
      lastModified: new Date(article.publishedAt),
      priority: 0.85,
      changeFrequency: "weekly",
    });
  }

  return specs;
}

/** Expand each logical path into one sitemap row per locale with full hreflang + x-default. */
export function buildMultilingualSitemap(
  specs: SitemapPathSpec[],
): MetadataRoute.Sitemap {
  const entries: SitemapEntry[] = [];

  for (const spec of specs) {
    const languages = buildHreflangAlternates(spec.path);

    for (const locale of routing.locales) {
      entries.push({
        url: localizedUrl(spec.path, locale),
        lastModified: spec.lastModified,
        changeFrequency: spec.changeFrequency,
        priority: spec.priority,
        alternates: { languages },
      });
    }
  }

  return dedupeByUrl(entries);
}

export function generateGoalCurrentSitemap(
  fallback: Date = new Date(),
): MetadataRoute.Sitemap {
  return buildMultilingualSitemap(collectSitemapPathSpecs(fallback));
}

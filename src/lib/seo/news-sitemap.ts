import {
  ARTICLE_INDEX,
  ARTICLES,
  articleHref,
  type Article,
} from "@/data/articles";
import { EDITORIAL_ARTICLES } from "@/data/editorial";
import { routing } from "@/i18n/routing";
import { localizedUrl } from "@/lib/i18n/urls";
import { NEWS_PUBLICATION_NAME } from "@/lib/seo/constants";
import { toNewsPublicationDate } from "@/lib/seo/dates";
import { escapeXml } from "@/lib/seo/xml";

/** Google News sitemaps must only list articles from the last 48 hours. */
const NEWS_WINDOW_MS = 48 * 60 * 60 * 1000;

export type NewsSitemapEntry = {
  loc: string;
  title: string;
  publicationDate: string;
  language: string;
};

const MIN_CONTENT_LENGTH = 280;

function isSubstantiveArticle(article: Article): boolean {
  const text = article.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length >= MIN_CONTENT_LENGTH;
}

function expandForDefaultLocale(
  path: string,
  title: string,
  publicationDate: string,
): NewsSitemapEntry[] {
  return [
    {
      loc: localizedUrl(path, routing.defaultLocale),
      title,
      publicationDate,
      language: routing.defaultLocale,
    },
  ];
}

function addLocalizedEntries(
  byLoc: Map<string, NewsSitemapEntry>,
  path: string,
  title: string,
  publicationDate: string,
): void {
  for (const entry of expandForDefaultLocale(path, title, publicationDate)) {
    byLoc.set(entry.loc, entry);
  }
}

/** Article and news URLs eligible for Google News sitemap (default locale only). */
export function getNewsSitemapEntries(): NewsSitemapEntry[] {
  const byLoc = new Map<string, NewsSitemapEntry>();

  for (const entry of ARTICLE_INDEX) {
    addLocalizedEntries(
      byLoc,
      entry.href ?? articleHref(entry.slug),
      entry.title,
      toNewsPublicationDate(entry.date),
    );
  }

  for (const article of ARTICLES) {
    if (!isSubstantiveArticle(article)) {
      continue;
    }
    addLocalizedEntries(
      byLoc,
      articleHref(article.slug),
      article.title,
      toNewsPublicationDate(article.date),
    );
  }

  for (const editorial of EDITORIAL_ARTICLES) {
    addLocalizedEntries(
      byLoc,
      editorial.path,
      editorial.title,
      toNewsPublicationDate(editorial.publishedAt),
    );
  }

  const now = Date.now();
  return [...byLoc.values()]
    .filter((entry) => isWithinNewsWindow(entry.publicationDate, now))
    .sort(
      (a, b) => Date.parse(b.publicationDate) - Date.parse(a.publicationDate),
    );
}

function isWithinNewsWindow(publicationDate: string, now: number): boolean {
  const publishedAt = Date.parse(publicationDate);
  if (Number.isNaN(publishedAt)) {
    return false;
  }
  return now - publishedAt <= NEWS_WINDOW_MS;
}

export function buildNewsSitemapXml(): string {
  const entries = getNewsSitemapEntries();
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(NEWS_PUBLICATION_NAME)}</news:name>
        <news:language>${escapeXml(entry.language)}</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(entry.publicationDate)}</news:publication_date>
      <news:title>${escapeXml(entry.title)}</news:title>
    </news:news>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>
`;
}

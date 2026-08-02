import type { ContentItem } from "@/content/types";
import { contentIdFromUrl, truncateDescription } from "@/content/merge";

export type ParsedRssItem = {
  title: string;
  link: string;
  description: string;
  publishedAt: string;
  thumbnail?: string;
  videoUrl?: string;
};

function decodeHtml(text: string): string {
  return text
    .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1).split("/")[0] || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const fromQuery = parsed.searchParams.get("v");
      if (fromQuery) {
        return fromQuery;
      }
      const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch?.[1]) {
        return embedMatch[1];
      }
    }
  } catch {
    return null;
  }
  return null;
}

function decodeXmlAttr(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function widthFromRssMediaTag(tag: string, url: string): number {
  const attrWidth = tag.match(/\bwidth=["']?(\d+)/i)?.[1];
  if (attrWidth) return Number(attrWidth);
  try {
    const parsed = new URL(url);
    const q = parsed.searchParams.get("width") || parsed.searchParams.get("w");
    if (q) return Number(q);
    const bbc = parsed.pathname.match(/\/(?:ace\/standard|news)\/(\d+)\//i);
    if (bbc?.[1]) return Number(bbc[1]);
    const ic = parsed.pathname.match(/\/images\/ic\/(\d+)x\d+\//i);
    if (ic?.[1]) return Number(ic[1]);
  } catch {
    /* ignore */
  }
  return 0;
}

/** Prefer larger media:content / enclosure over tiny media:thumbnail when present. */
function pickBestRssImageUrl(itemXml: string): string {
  const candidates: { url: string; width: number }[] = [];
  const tagRe =
    /<(?:media:thumbnail|media:content|enclosure)\b[^>]*\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(itemXml)) !== null) {
    const tag = match[0];
    const urlMatch = tag.match(/\burl=["']([^"']+)["']/i);
    if (!urlMatch?.[1]) continue;
    const url = decodeXmlAttr(urlMatch[1]).trim();
    if (!/^https?:\/\//i.test(url)) continue;
    candidates.push({ url, width: widthFromRssMediaTag(tag, url) });
  }

  if (!candidates.length) {
    const fallback =
      itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i) ||
      itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i) ||
      itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    return fallback?.[1] ? decodeXmlAttr(fallback[1]).trim() : "";
  }

  candidates.sort((a, b) => b.width - a.width);
  return candidates[0].url;
}

export function parseRssItemXml(itemXml: string): ParsedRssItem | null {
  const titleMatch =
    itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) ||
    itemXml.match(/<title>([\s\S]*?)<\/title>/i);
  const linkMatch =
    itemXml.match(/<link>([\s\S]*?)<\/link>/i) ||
    itemXml.match(/<guid>([\s\S]*?)<\/guid>/i);
  const descMatch =
    itemXml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/i) ||
    itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) ||
    itemXml.match(/<description>([\s\S]*?)<\/description>/i);
  const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
  const title = decodeHtml(titleMatch?.[1] ?? "");
  const link = decodeHtml(linkMatch?.[1] ?? "");
  const description = decodeHtml(descMatch?.[1] ?? "");
  const pubDate = pubDateMatch?.[1] ?? "";
  const image = pickBestRssImageUrl(itemXml);

  if (!title || !link) {
    return null;
  }

  const videoFromDesc =
    description.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+)/i)?.[0] ??
    link.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+)/i)?.[0];

  const videoId = videoFromDesc ? extractYouTubeVideoId(videoFromDesc) : null;
  const videoUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : undefined;

  return {
    title,
    link,
    description,
    publishedAt: pubDate
      ? new Date(pubDate).toISOString()
      : new Date().toISOString(),
    ...(image ? { thumbnail: image } : {}),
    ...(videoUrl ? { videoUrl } : {}),
  };
}

export function parseRssXml(xml: string): ParsedRssItem[] {
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
  const parsed: ParsedRssItem[] = [];

  for (const item of items) {
    const row = parseRssItemXml(item);
    if (row) {
      parsed.push(row);
    }
  }

  return parsed;
}

export function rssItemToContent(
  item: ParsedRssItem,
  source: string,
  kind: ContentItem["kind"] = "news",
): ContentItem {
  return {
    id: contentIdFromUrl(item.link),
    title: item.title,
    description: truncateDescription(item.description),
    url: item.link,
    publishedAt: item.publishedAt,
    source,
    kind,
    ...(item.thumbnail ? { thumbnail: item.thumbnail } : {}),
  };
}

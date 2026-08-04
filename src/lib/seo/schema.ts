import { routing } from "@/i18n/routing";
import { localizedUrl } from "@/lib/i18n/urls";
import {
  DEFAULT_OG_IMAGE_ALT,
  EDITORIAL_AUTHOR,
  EDITORIAL_PUBLISHER,
} from "@/lib/seo/constants";
import { toIsoDate } from "@/lib/seo/dates";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site-url";
import { defaultOgImageUrl } from "@/lib/seo/constants";

export type ArticleSchemaInput = {
  path: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  image?: string;
  locale?: string;
};

export type SportsEventSchemaInput = {
  name: string;
  startDate: string;
  endDate?: string;
  path: string;
  homeTeamName: string;
  awayTeamName: string;
  venueName?: string;
  city?: string;
  eventStatus?: string;
  description?: string;
  image?: string;
  locale?: string;
  country?: string;
  competition?: string;
  organizerUrl?: string;
  /** Minutes after kickoff for default endDate when endDate is omitted. */
  durationMinutes?: number;
};

export type SportsTeamSchemaInput = {
  name: string;
  url: string;
  sport?: string;
  memberOfName: string;
  memberOfType?: "SportsEvent" | "SportsOrganization";
  locationName?: string;
};

type SchemaNode = Record<string, unknown>;

function stripContext(node: SchemaNode): SchemaNode {
  const { "@context": _context, ...rest } = node;
  return rest;
}

/** Combine multiple schema.org nodes without duplicate @context keys. */
export function combineSchemaGraph(
  nodes: (SchemaNode | null | undefined)[],
): SchemaNode {
  const valid = nodes.filter(
    (node): node is SchemaNode =>
      node != null && Object.keys(node).length > 0,
  );
  if (valid.length === 0) {
    return { "@context": "https://schema.org" };
  }
  if (valid.length === 1) {
    return valid[0]["@context"]
      ? valid[0]
      : { "@context": "https://schema.org", ...valid[0] };
  }
  return {
    "@context": "https://schema.org",
    "@graph": valid.map((node) => stripContext(node)),
  };
}

export function organizationSchema(): SchemaNode {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icons/icon-192.png"),
  };
}

export function webSiteSchema(locale = "en"): SchemaNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/worldcup2026/teams?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function siteGraphSchema(locale = "en"): SchemaNode {
  return combineSchemaGraph([organizationSchema(), webSiteSchema(locale)]);
}

export function newsArticleSchema(input: ArticleSchemaInput): SchemaNode {
  const locale = input.locale ?? routing.defaultLocale;
  const url = localizedUrl(input.path, locale);
  const published = toIsoDate(input.datePublished);
  const modified = toIsoDate(input.dateModified ?? input.datePublished);

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: input.headline,
    description: input.description,
    datePublished: published,
    dateModified: modified,
    inLanguage: locale,
    image: [input.image ?? defaultOgImageUrl()],
    author: {
      "@type": "Person",
      name: input.author ?? EDITORIAL_AUTHOR,
    },
    publisher: {
      "@type": "Organization",
      name: EDITORIAL_PUBLISHER,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icons/icon-192.png"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
  };
}

function hostCountryIso(country?: string): string | undefined {
  if (!country) {
    return undefined;
  }
  if (country === "USA") {
    return "US";
  }
  if (country === "Mexico") {
    return "MX";
  }
  if (country === "Canada") {
    return "CA";
  }
  return country;
}

function eventEndDateIso(startDate: string, durationMinutes: number): string {
  const startMs = Date.parse(startDate);
  if (!Number.isFinite(startMs)) {
    return startDate;
  }
  return new Date(startMs + durationMinutes * 60_000).toISOString();
}

function isPlaceholderTeamName(name: string): boolean {
  const trimmed = name.trim();
  return (
    trimmed === "" ||
    trimmed === "TBD" ||
    trimmed.startsWith("Winner Match") ||
    trimmed.startsWith("Best 3rd")
  );
}

export function sportsEventSchema(
  input: SportsEventSchemaInput,
): SchemaNode | null {
  const homeTeam = input.homeTeamName?.trim() ?? "";
  const awayTeam = input.awayTeamName?.trim() ?? "";

  if (isPlaceholderTeamName(homeTeam) && isPlaceholderTeamName(awayTeam)) {
    return null;
  }

  const locale = input.locale ?? routing.defaultLocale;
  const url = localizedUrl(input.path, locale);
  const startDate = input.startDate || new Date().toISOString();
  const durationMinutes = input.durationMinutes ?? 120;
  const endDate = input.endDate ?? eventEndDateIso(startDate, durationMinutes);
  const countryCode = hostCountryIso(input.country);
  const organizerName = input.competition || "Football";
  const organizerUrl = input.organizerUrl ?? SITE_URL;
  const description =
    input.description?.trim() ||
    `${organizerName} — ${homeTeam || "Home"} vs ${awayTeam || "Away"}. Live scores, lineups and statistics on ${SITE_NAME}.`;

  const performers = [
    !isPlaceholderTeamName(homeTeam)
      ? { "@type": "SportsTeam" as const, name: homeTeam }
      : null,
    !isPlaceholderTeamName(awayTeam)
      ? { "@type": "SportsTeam" as const, name: awayTeam }
      : null,
  ].filter((entry): entry is { "@type": "SportsTeam"; name: string } => entry != null);

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "@id": url,
    url,
    name: input.name?.trim() || `${homeTeam || "Home"} vs ${awayTeam || "Away"}`,
    description,
    image: [input.image ?? defaultOgImageUrl()],
    startDate,
    endDate,
    eventStatus: input.eventStatus ?? "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: input.venueName || input.city || "TBD",
      address: {
        "@type": "PostalAddress",
        ...(input.city ? { addressLocality: input.city } : {}),
        ...(countryCode ? { addressCountry: countryCode } : {}),
      },
    },
    ...(performers.length > 0 ? { performer: performers } : {}),
    organizer: {
      "@type": "Organization",
      name: organizerName,
      url: organizerUrl,
    },
    offers: {
      "@type": "Offer",
      name: "Free live match centre",
      url,
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      validFrom: startDate,
    },
  };
}

export type LiveBlogPostingSchemaInput = {
  path: string;
  headline: string;
  coverageStartTime: string;
  coverageEndTime?: string;
  liveBlogUpdate: Array<{ text: string; datePublished: string }>;
  locale?: string;
};

export function liveBlogPostingSchema(
  input: LiveBlogPostingSchemaInput,
): SchemaNode | null {
  if (!input.liveBlogUpdate.length) {
    return null;
  }

  const locale = input.locale ?? routing.defaultLocale;
  const url = localizedUrl(input.path, locale);
  const headline = input.headline.trim();
  if (!headline) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "LiveBlogPosting",
    "@id": url,
    url,
    headline,
    coverageStartTime: input.coverageStartTime,
    ...(input.coverageEndTime
      ? { coverageEndTime: input.coverageEndTime }
      : {}),
    liveBlogUpdate: input.liveBlogUpdate.map((update) => ({
      "@type": "BlogPosting",
      headline: update.text,
      datePublished: update.datePublished,
    })),
  };
}

export function sportsTeamSchema(input: SportsTeamSchemaInput): SchemaNode {
  const memberOfType = input.memberOfType ?? "SportsOrganization";

  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: input.name,
    sport: input.sport ?? "Soccer",
    url: input.url,
    memberOf: {
      "@type": memberOfType,
      name: input.memberOfName,
    },
    location: input.locationName
      ? {
          "@type": "Place",
          name: input.locationName,
        }
      : undefined,
    logo: defaultOgImageUrl(),
  };
}

export { DEFAULT_OG_IMAGE_ALT };

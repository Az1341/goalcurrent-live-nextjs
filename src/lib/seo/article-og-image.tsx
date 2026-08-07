import { ImageResponse } from "next/og";
import {
  ARTICLE_INDEX,
  articleHref,
  getArticleBySlug,
  type Article,
} from "@/data/articles";
import {
  ARTICLE_CARD_IMAGES,
  isWorldCup2026EditorialLink,
} from "@/lib/article-hub";
import { absoluteUrl, SITE_NAME } from "@/lib/site-url";

export const ARTICLE_OG_SIZE = { width: 1200, height: 630 } as const;

/** Brand tokens from globals.css — keep OG palette in sync with site chrome. */
const OG_COLORS = {
  brand: "#C8102E",
  brandDark: "#a00d24",
  pinkBg: "#FFF1F2",
  pinkBorder: "#FECACA",
  heading: "#1e293b",
  muted: "#475569",
  green: "#16A34A",
  white: "#ffffff",
  surface: "#f8fafc",
} as const;

export type ArticleOgCategory =
  | "World Cup 2026"
  | "Premier League"
  | "Champions League"
  | "Editorial";

const ARTICLE_CATEGORY_LABEL: Record<Article["category"], ArticleOgCategory> = {
  "world-cup-2026": "World Cup 2026",
  "premier-league": "Premier League",
  "champions-league": "Champions League",
  editorial: "Editorial",
};

export function hasDedicatedArticleCardImage(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(ARTICLE_CARD_IMAGES, slug);
}

export function resolveArticleOgCategory(slug: string): ArticleOgCategory {
  const article = getArticleBySlug(slug);
  if (article) {
    return ARTICLE_CATEGORY_LABEL[article.category];
  }

  const normalized = slug.toLowerCase();
  if (
    isWorldCup2026EditorialLink(articleHref(normalized), normalized) ||
    normalized.includes("world-cup") ||
    normalized.includes("worldcup")
  ) {
    return "World Cup 2026";
  }
  if (normalized.includes("premier-league")) {
    return "Premier League";
  }
  if (normalized.includes("champions-league")) {
    return "Champions League";
  }
  return "Editorial";
}

export function resolveArticleOgTitle(slug: string): string | null {
  const article = getArticleBySlug(slug);
  if (article?.title) return article.title;
  const indexEntry = ARTICLE_INDEX.find((entry) => entry.slug === slug);
  return indexEntry?.title ?? null;
}

/** Absolute share/schema image: dedicated card art, else generated OG endpoint. */
export function resolveArticleShareImageUrl(slug: string): string {
  const dedicated = ARTICLE_CARD_IMAGES[slug];
  if (dedicated) {
    return absoluteUrl(dedicated);
  }
  return absoluteUrl(`/api/og/article/${encodeURIComponent(slug)}`);
}

export function articleGeneratedOgPath(slug: string): string {
  return `/api/og/article/${encodeURIComponent(slug)}`;
}

function truncateTitle(title: string, max = 110): string {
  const trimmed = title.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export function renderArticleOgImage(input: {
  title: string;
  category: ArticleOgCategory;
}): ImageResponse {
  const title = truncateTitle(input.title);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `linear-gradient(135deg, ${OG_COLORS.pinkBg} 0%, ${OG_COLORS.white} 48%, ${OG_COLORS.surface} 100%)`,
          padding: "48px 56px",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: OG_COLORS.heading,
            }}
          >
            <span>Goal</span>
            <span style={{ color: OG_COLORS.brand }}>Current</span>
            <span>.live</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 18px",
              borderRadius: 999,
              background: OG_COLORS.white,
              border: `2px solid ${OG_COLORS.green}`,
              color: OG_COLORS.green,
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {input.category}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            width: "100%",
            maxWidth: 1040,
          }}
        >
          <div
            style={{
              width: 96,
              height: 8,
              borderRadius: 999,
              background: OG_COLORS.brand,
            }}
          />
          <div
            style={{
              fontSize: title.length > 70 ? 52 : 60,
              fontWeight: 800,
              lineHeight: 1.15,
              color: OG_COLORS.heading,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            fontFamily: "system-ui, sans-serif",
            color: OG_COLORS.muted,
            fontSize: 22,
          }}
        >
          <span>Independent football coverage</span>
          <span style={{ color: OG_COLORS.brandDark, fontWeight: 700 }}>
            {SITE_NAME}
          </span>
        </div>
      </div>
    ),
    {
      ...ARTICLE_OG_SIZE,
    },
  );
}

export function generateArticleOgImageResponse(slug: string): ImageResponse | null {
  const title = resolveArticleOgTitle(slug);
  if (!title) return null;
  return renderArticleOgImage({
    title,
    category: resolveArticleOgCategory(slug),
  });
}

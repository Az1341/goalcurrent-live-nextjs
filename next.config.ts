import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";
import { REMOTE_IMAGE_HOSTNAMES } from "./src/lib/images";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

type RouteRedirect = NonNullable<
  Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>
>[number];

/** CSP is applied per-request in src/proxy.ts (Next.js 16 middleware). */
const SITE_REDIRECTS: RouteRedirect[] = [
  {
    source: "/google-play-badge.png",
    destination: "/images/google-play-badge.png",
    permanent: true,
  },
  { source: "/video", destination: "/videos", permanent: true },
  { source: "/video/:path*", destination: "/videos/:path*", permanent: true },
  {
    source: "/worldcup2026/favourites",
    destination: "/favourites",
    permanent: true,
  },
  { source: "/news/articles", destination: "/articles", permanent: true },
  {
    source: "/news/articles/:slug",
    destination: "/articles/:slug",
    permanent: true,
  },
  {
    source: "/news/alireza-beiranvand-iran-world-cup-hero",
    destination: "/articles/alireza-beiranvand-iran-world-cup-hero",
    permanent: true,
  },
  {
    source: "/worldcup2026/match/:fixtureId",
    destination: "/match/:fixtureId",
    permanent: true,
  },
  {
    source: "/statistics/top-scorers",
    destination: "/premier-league/statistics",
    permanent: true,
  },
  {
    source: "/statistics/assists",
    destination: "/premier-league/statistics",
    permanent: true,
  },
  {
    source: "/statistics/disciplinary",
    destination: "/premier-league/statistics",
    permanent: true,
  },
  {
    source: "/:path*",
    has: [{ type: "host", value: "goalcurrent.online" }],
    destination: "https://goalcurrent.live/:path*",
    permanent: true,
  },
  {
    source: "/:path*",
    has: [{ type: "host", value: "www.goalcurrent.online" }],
    destination: "https://goalcurrent.live/:path*",
    permanent: true,
  },
];

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600],
    imageSizes: [16, 24, 32, 48, 64, 96, 128, 256],
    remotePatterns: REMOTE_IMAGE_HOSTNAMES.map((hostname) => ({
      protocol: "https" as const,
      hostname,
      pathname: "/**",
    })),
  },
  async redirects() {
    return SITE_REDIRECTS;
  },
  async rewrites() {
    return [
      {
        source: "/.well-known/assetlinks.json",
        destination: "/api/well-known/assetlinks",
      },
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap",
      },
      {
        source: "/sitemap-news.xml",
        destination: "/api/sitemap-news",
      },
      {
        source: "/robots.txt",
        destination: "/api/robots",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(|live|news|news/world-cup|articles)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source:
          "/:locale(ar|de|en|es|fa|fr|it|nl|pt)/:path(live|news|articles|news/world-cup)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/:locale(ar|de|en|es|fa|fr|it|nl|pt)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          { key: "Content-Type", value: "application/javascript" },
        ],
      },
      {
        source: "/firebase-messaging-sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          { key: "Content-Type", value: "application/javascript" },
        ],
      },
      {
        source: "/OneSignalSDKWorker.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          { key: "Content-Type", value: "application/javascript" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});

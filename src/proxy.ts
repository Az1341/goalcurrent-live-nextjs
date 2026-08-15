import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { CONTENT_SECURITY_POLICY } from "@/lib/security/csp";
import {
  checkRateLimitAsync,
  clientIpFromRequest,
} from "@/lib/rate-limit";
import {
  PREVIEW_X_ROBOTS_TAG,
  shouldNoIndexDeploy,
} from "@/lib/seo/deploy-robots";

const LEGACY_GROUP_PATH = /^\/worldcup2026\/groups\/group-([a-l])$/i;
const LOCALE_PREFIX = /^\/(en|es|it|de|fr|nl)(\/|$)/;
const LOCALE_NEXT_ASSET =
  /^\/(en|es|it|de|fr|nl)\/_next\/(.+)$/;
const LOCALE_API =
  /^\/(en|es|it|de|fr|nl)\/api\/(.+)$/;
const LOCALE_PUBLIC_ASSET =
  /^\/(en|es|it|de|fr|nl)\/(flags|images|icons)(\/.*)?$/;
const LOCALE_PUBLIC_FILE =
  /^\/(en|es|it|de|fr|nl)\/(logo\.svg|favicon\.ico|favicon\.svg|sw\.js|firebase-messaging-sw\.js|OneSignalSDKWorker\.js|OneSignalSDKUpdaterWorker\.js|manifest\.json)$/;
const ROOT_PUBLIC_FILE = /^\/[^/]+\.[A-Za-z0-9]+$/;

const PUBLIC_STATIC_FILES = new Set([
  "/logo.svg",
  "/favicon.ico",
  "/favicon.svg",
  "/sw.js",
  "/firebase-messaging-sw.js",
  "/OneSignalSDKWorker.js",
  "/OneSignalSDKUpdaterWorker.js",
  "/manifest.json",
]);

function isRootPublicStaticPath(pathname: string): boolean {
  if (PUBLIC_STATIC_FILES.has(pathname) || ROOT_PUBLIC_FILE.test(pathname)) {
    return true;
  }
  return (
    pathname.startsWith("/flags/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/icons/")
  );
}

const handleI18n = createIntlMiddleware(routing);

const SITE_REDIRECTS: Array<{ source: RegExp; destination: (match: RegExpMatchArray, localePrefix: string) => string }> = [
  {
    source: /^\/home\/?$/,
    destination: (_m, prefix) => prefix || "/",
  },
  {
    source: /^\/video\/?$/,
    destination: (_m, prefix) => `${prefix}/videos`,
  },
  {
    source: /^\/video\/(.+)$/,
    destination: (m, prefix) => `${prefix}/videos/${m[1]}`,
  },
  {
    source: /^\/worldcup2026\/favourites\/?$/,
    destination: (_m, prefix) => `${prefix}/favourites`,
  },
  {
    source: /^\/news\/articles\/?$/,
    destination: (_m, prefix) => `${prefix}/articles`,
  },
  {
    source: /^\/news\/articles\/(.+)$/,
    destination: (m, prefix) => `${prefix}/articles/${m[1]}`,
  },
  {
    source: /^\/news\/alireza-beiranvand-iran-world-cup-hero\/?$/,
    destination: (_m, prefix) =>
      `${prefix}/articles/alireza-beiranvand-iran-world-cup-hero`,
  },
  {
    source: /^\/worldcup2026\/match\/(.+)$/,
    destination: (m, prefix) => `${prefix}/match/${m[1]}`,
  },
  {
    source: /^\/statistics\/top-scorers\/?$/,
    destination: (_m, prefix) => `${prefix}/premier-league/statistics`,
  },
  {
    source: /^\/statistics\/assists\/?$/,
    destination: (_m, prefix) => `${prefix}/premier-league/statistics`,
  },
  {
    source: /^\/statistics\/disciplinary\/?$/,
    destination: (_m, prefix) => `${prefix}/premier-league/statistics`,
  },
];

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  if (shouldNoIndexDeploy()) {
    response.headers.set("X-Robots-Tag", PREVIEW_X_ROBOTS_TAG);
  }
  return response;
}

function localePrefixFromPath(pathname: string): string {
  const match = LOCALE_PREFIX.exec(pathname);
  if (!match) return "";
  const locale = match[1];
  return locale === routing.defaultLocale ? "" : `/${locale}`;
}

function applyLegacyRedirects(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const localePrefix = localePrefixFromPath(pathname);
  const pathWithoutLocale = localePrefix
    ? pathname.slice(localePrefix.length) || "/"
    : pathname;

  const legacyGroup = LEGACY_GROUP_PATH.exec(pathWithoutLocale);
  if (legacyGroup) {
    const url = request.nextUrl.clone();
    url.pathname = `${localePrefix}/worldcup2026/groups/${legacyGroup[1]!.toLowerCase()}`;
    return applySecurityHeaders(NextResponse.redirect(url, 307));
  }

  for (const rule of SITE_REDIRECTS) {
    const match = rule.source.exec(pathWithoutLocale);
    if (match) {
      const url = request.nextUrl.clone();
      url.pathname = rule.destination(match, localePrefix);
      return applySecurityHeaders(NextResponse.redirect(url, 308));
    }
  }

  return null;
}

/** Next.js 16 proxy — locale routing, legacy redirects, CSP. */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/.well-known/assetlinks.json") {
    const url = request.nextUrl.clone();
    url.pathname = "/api/well-known/assetlinks";
    return NextResponse.rewrite(url);
  }

  if (pathname === "/sitemap.xml") {
    const url = request.nextUrl.clone();
    url.pathname = "/api/sitemap";
    return NextResponse.rewrite(url);
  }

  if (pathname === "/sitemap-news.xml") {
    const url = request.nextUrl.clone();
    url.pathname = "/api/sitemap-news";
    return NextResponse.rewrite(url);
  }

  if (pathname === "/robots.txt") {
    const url = request.nextUrl.clone();
    url.pathname = "/api/robots";
    const response = NextResponse.rewrite(url);
    if (shouldNoIndexDeploy()) {
      response.headers.set("X-Robots-Tag", PREVIEW_X_ROBOTS_TAG);
    }
    return response;
  }

  const localeAsset = LOCALE_NEXT_ASSET.exec(pathname);
  if (localeAsset) {
    const url = request.nextUrl.clone();
    url.pathname = `/_next/${localeAsset[2]}`;
    return NextResponse.rewrite(url);
  }

  const localeApi = LOCALE_API.exec(pathname);
  if (localeApi) {
    const url = request.nextUrl.clone();
    url.pathname = `/api/${localeApi[2]}`;
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith("/api/")) {
    const ip = clientIpFromRequest(request);
    const rateLimit = await checkRateLimitAsync(ip, pathname);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "rate_limit",
            message: "Too many requests.",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSec),
          },
        },
      );
    }
    return NextResponse.next();
  }

  const localePublic =
    LOCALE_PUBLIC_ASSET.exec(pathname) ?? LOCALE_PUBLIC_FILE.exec(pathname);
  if (localePublic) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/(en|es|it|de|fr|nl)/, "") || "/";
    return NextResponse.rewrite(url);
  }

  const pastelPath =
    pathname === "/preview-pastel" ||
    /^\/(en|es|it|de|fr|nl)\/preview-pastel\/?$/.test(pathname);
  if (pastelPath && process.env.VERCEL_ENV === "production") {
    return applySecurityHeaders(
      new NextResponse("Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }),
    );
  }

  // Every root-level file with an extension belongs to /public. Bypass i18n so
  // brand assets (e.g. sepanai-mark.svg) are not rewritten to /en/*.svg.
  if (isRootPublicStaticPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  const legacyRedirect = applyLegacyRedirects(request);
  if (legacyRedirect) {
    return legacyRedirect;
  }

  const response = handleI18n(request);
  return applySecurityHeaders(response);
}

export const proxyConfig = {
  matcher: [
    "/api/:path*",
    "/.well-known/assetlinks.json",
    "/sitemap.xml",
    "/sitemap-news.xml",
    "/robots.txt",
    "/((?!api|_next|_vercel|favicon.ico|sw.js|firebase-messaging-sw.js|OneSignalSDKWorker.js|manifest.json|.*\\..*).*)",
  ],
};

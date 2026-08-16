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
import {
  canonicalHostRedirectUrl,
  removedLocaleRedirectPath,
} from "@/lib/seo/canonical-host";

const LEGACY_GROUP_PATH = /^\/worldcup2026\/groups\/group-([a-l])$/i;
const LOCALE_PREFIX = /^\/(en|es|it|de|fr|nl)(\/|$)/;
const LOCALE_NEXT_ASSET = /^\/(en|es|it|de|fr|nl)\/_next\/(.+)$/;
const LOCALE_API = /^\/(en|es|it|de|fr|nl)\/api\/(.+)$/;
const LOCALE_PUBLIC_ASSET = /^\/(en|es|it|de|fr|nl)\/(flags|images|icons)(\/.*)?$/;
const LOCALE_PUBLIC_FILE = /^\/(en|es|it|de|fr|nl)\/(logo\.svg|favicon\.ico|favicon\.svg|sw\.js|firebase-messaging-sw\.js|OneSignalSDKWorker\.js|OneSignalSDKUpdaterWorker\.js|manifest\.json)$/;
const ROOT_PUBLIC_FILE = /^\/[^/]+\.[A-Za-z0-9]+$/;
const PL_MATCH_PATH = /^\/(?:(?:en|es|it|de|fr|nl)\/)?premier-league\/match\/([^/]+)\/?$/;
const LEGACY_ANDROID_TWA_WC26_PATH = /^\/(?:(?:en|es|it|de|fr|nl)\/)?worldcup2026\/?$/i;
const ANDROID_TWA_COOKIE = "gc_android_twa_current";

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

function malformedPremierLeagueMatchPath(pathname: string): boolean {
  const match = PL_MATCH_PATH.exec(pathname);
  if (!match) return false;
  const fixtureId = match[1] ?? "";
  if (!/^\d+$/.test(fixtureId)) return true;
  const parsed = Number(fixtureId);
  return !Number.isSafeInteger(parsed) || parsed <= 0;
}

const handleI18n = createIntlMiddleware(routing);

const SITE_REDIRECTS: Array<{
  source: RegExp;
  destination: (match: RegExpMatchArray, localePrefix: string) => string;
}> = [
  { source: /^\/home\/?$/, destination: (_m, prefix) => prefix || "/" },
  { source: /^\/video\/?$/, destination: (_m, prefix) => `${prefix}/videos` },
  { source: /^\/video\/(.+)$/, destination: (m, prefix) => `${prefix}/videos/${m[1]}` },
  { source: /^\/worldcup2026\/favourites\/?$/, destination: (_m, prefix) => `${prefix}/favourites` },
  { source: /^\/news\/articles\/?$/, destination: (_m, prefix) => `${prefix}/articles` },
  { source: /^\/news\/articles\/(.+)$/, destination: (m, prefix) => `${prefix}/articles/${m[1]}` },
  {
    source: /^\/news\/alireza-beiranvand-iran-world-cup-hero\/?$/,
    destination: (_m, prefix) => `${prefix}/articles/alireza-beiranvand-iran-world-cup-hero`,
  },
  { source: /^\/worldcup2026\/match\/(.+)$/, destination: (m, prefix) => `${prefix}/match/${m[1]}` },
  { source: /^\/statistics\/top-scorers\/?$/, destination: (_m, prefix) => `${prefix}/premier-league/statistics` },
  { source: /^\/statistics\/assists\/?$/, destination: (_m, prefix) => `${prefix}/premier-league/statistics` },
  { source: /^\/statistics\/disciplinary\/?$/, destination: (_m, prefix) => `${prefix}/premier-league/statistics` },
];

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  if (shouldNoIndexDeploy()) {
    response.headers.set("X-Robots-Tag", PREVIEW_X_ROBOTS_TAG);
  }
  return response;
}

function legacyAndroidTwaRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (!LEGACY_ANDROID_TWA_WC26_PATH.test(pathname)) return null;

  const referrer = request.headers.get("referer") ?? "";
  const userAgent = request.headers.get("user-agent") ?? "";
  const requestedWith = request.headers.get("x-requested-with") ?? "";
  const launchedByGoalCurrentApp =
    referrer.startsWith("android-app://com.goalcurrent.app") ||
    requestedWith === "com.goalcurrent.app";
  const knownGoalCurrentApp =
    request.cookies.get(ANDROID_TWA_COOKIE)?.value === "1";
  const isAndroidNavigation = /Android/i.test(userAgent);

  // The currently published Android TWA has /worldcup2026 baked in as its old
  // launch URL. Intercept that exact archive-hub route before HTML renders so
  // the installed app mirrors the current mobile website without a flash/loop.
  // WC26 sub-routes remain untouched and desktop/iOS web visitors retain archive access.
  if (!launchedByGoalCurrentApp && !knownGoalCurrentApp && !isAndroidNavigation) {
    return null;
  }

  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";

  const response = applySecurityHeaders(NextResponse.redirect(url, 307));
  response.headers.set("Cache-Control", "no-store");

  if (launchedByGoalCurrentApp || isAndroidNavigation) {
    response.cookies.set(ANDROID_TWA_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
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

/** Next.js 16 proxy — canonical host, locale routing, legacy redirects, CSP. */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const androidTwaRedirect = legacyAndroidTwaRedirect(request);
  if (androidTwaRedirect) {
    return androidTwaRedirect;
  }

  const canonicalHost = canonicalHostRedirectUrl(request.nextUrl);
  if (canonicalHost) {
    return applySecurityHeaders(NextResponse.redirect(canonicalHost, 308));
  }

  const removedLocalePath = removedLocaleRedirectPath(pathname);
  if (removedLocalePath) {
    const url = request.nextUrl.clone();
    url.pathname = removedLocalePath;
    return applySecurityHeaders(NextResponse.redirect(url, 308));
  }

  if (malformedPremierLeagueMatchPath(pathname)) {
    const response = new NextResponse("Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
    return applySecurityHeaders(response);
  }

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
    // The browser regression suite runs all journeys through one localhost IP.
    // Do not let that synthetic shared IP exhaust production rate-limit buckets;
    // the limiter itself is covered independently by unit tests.
    if (process.env.CI !== "true") {
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
            headers: { "Retry-After": String(rateLimit.retryAfterSec) },
          },
        );
      }
    }
    return NextResponse.next();
  }

  const localePublic = LOCALE_PUBLIC_ASSET.exec(pathname) ?? LOCALE_PUBLIC_FILE.exec(pathname);
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

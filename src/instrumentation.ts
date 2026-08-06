import * as Sentry from "@sentry/nextjs";
import type { LOCALES } from "@/i18n/locales";

/** Supported locales for telemetry tracking (6 approved languages). */
const TRACKED_LOCALES: readonly (typeof LOCALES)[number][] = [
  "en",
  "es",
  "it",
  "de",
  "fr",
  "nl",
];

/**
 * Initialize telemetry logging with locale context.
 * Runs on both Node.js (server) and Edge runtime.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
    initializeLogging("nodejs");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
    initializeLogging("edge");
  }
}

/**
 * Initialize telemetry logging with structured context.
 */
function initializeLogging(runtime: "nodejs" | "edge") {
  try {
    const logMessage = `Instrumentation initialized: ${runtime} runtime with ${TRACKED_LOCALES.length} locales [${TRACKED_LOCALES.join(", ")}]`;
    console.log(logMessage, {
      localeCount: TRACKED_LOCALES.length,
      features: {
        rtl: [],
        multilingual: true,
        swr_polling: true,
        visibility_aware: true,
      },
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Failed to initialize logging:", error);
  }
}

/**
 * Enhanced error handler with locale-aware logging.
 */
export const onRequestError = (error: Error, request: Request) => {
  // Log error with request context
  const url = new URL(request.url);
  const locale = extractLocaleFromPath(url.pathname);

  console.error("Request error", {
    error: error.message,
    stack: error.stack,
    locale,
    method: request.method,
    path: url.pathname,
    url: url.href,
  });

  // Forward to Sentry for alerting
  const requestInfo = {
    method: request.method,
    path: url.pathname,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
  };
  return Sentry.captureRequestError(error, requestInfo, {
    routerKind: "app",
    routePath: url.pathname,
    routeType: "render",
  });
};

/**
 * Extract locale from request path (e.g., /en/page, /es/page).
 */
function extractLocaleFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/([a-z]{2})(?:\/|$)/);
  return match ? match[1] : null;
}

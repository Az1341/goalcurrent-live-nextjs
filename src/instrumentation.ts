import * as Sentry from "@sentry/nextjs";
import type { Instrumentation } from "next";
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
 * Next.js passes a plain request descriptor ({ path, method, headers }), not a Fetch Request.
 */
export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  errorContext,
) => {
  const path = request.path;
  const locale = extractLocaleFromPath(path);
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error("Request error", {
    error: message,
    stack,
    locale,
    method: request.method,
    path,
  });

  // Forward to Sentry for alerting — same shape Sentry.captureRequestError expects.
  Sentry.captureRequestError(
    error,
    {
      path: request.path,
      method: request.method,
      headers: { ...request.headers },
    },
    {
      routerKind: errorContext.routerKind,
      routePath: errorContext.routePath || request.path,
      routeType: errorContext.routeType,
    },
  );
};

/**
 * Extract locale from request path (e.g., /en/page, /es/page).
 */
export function extractLocaleFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/([a-z]{2})(?:\/|$)/);
  return match ? match[1] : null;
}
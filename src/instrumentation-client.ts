import * as Sentry from "@sentry/nextjs";
import "../sentry.client.config";

/** Initialize client-side telemetry on first import. */
if (typeof window !== "undefined") {
  initializeClientTelemetry();
}

/**
 * Set up client-side logging with language/locale context.
 */
function initializeClientTelemetry() {
  try {
    const locale = extractLocaleFromUrl() || "unknown";
    const isRTL = false;

    const telemetryMsg = `Client telemetry initialized: locale=${locale}, RTL=${isRTL}`;
    console.log(telemetryMsg, {
      userAgent: navigator.userAgent,
      viewport: {
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
      },
    });
  } catch (error) {
    console.warn("Client telemetry init skipped:", error);
  }
}

/**
 * Extract locale from current URL pathname.
 */
function extractLocaleFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const match = window.location.pathname.match(/^\/([a-z]{2})(?:\/|$)/);
  return match ? match[1] : null;
}

export const onRouterTransitionStart = (href: string, navigationType: string) => {
  // Log route transitions with locale context
  const toLocale = extractLocaleFromPathString(href);
  console.debug("Route transition", {
    href,
    navigationType,
    locale: toLocale,
  });

  return Sentry.captureRouterTransitionStart(href, navigationType);
};

/**
 * Extract locale from route path string.
 */
function extractLocaleFromPathString(path: string): string | null {
  const match = path.match(/^\/([a-z]{2})(?:\/|$)/);
  return match ? match[1] : null;
}

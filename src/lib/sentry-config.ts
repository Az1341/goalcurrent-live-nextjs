import type { ErrorEvent, NodeOptions } from "@sentry/nextjs";

/** Request headers that must never leave the process via Sentry telemetry. */
const SENTRY_REDACTED_REQUEST_HEADERS = new Set([
  "authorization",
  "cookie",
  "x-cron-secret",
  "x-debug-secret",
]);

/**
 * Mutates Sentry request headers in place, deleting known secret header keys
 * case-insensitively (Sentry may preserve original casing).
 */
export function redactSentryRequestHeaders(
  headers: Record<string, string> | undefined,
): void {
  if (!headers) return;
  for (const key of Object.keys(headers)) {
    if (SENTRY_REDACTED_REQUEST_HEADERS.has(key.toLowerCase())) {
      delete headers[key];
    }
  }
}

export function getSentryDsn(): string | undefined {
  return process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
}

export function isSentryEnabled(): boolean {
  return Boolean(getSentryDsn());
}

export function buildSentryInitOptions(): NodeOptions {
  return {
    dsn: getSentryDsn(),
    tracesSampleRate: 0.1,
    enabled: isSentryEnabled(),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    beforeSend(event: ErrorEvent) {
      redactSentryRequestHeaders(event.request?.headers);
      return event;
    },
  };
}

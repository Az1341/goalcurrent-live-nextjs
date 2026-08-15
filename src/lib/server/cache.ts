import { LRUCache } from "lru-cache";

type CacheEntry = {
  value: unknown;
};

/** In-memory per-instance cache — cleared on deploy / cold start. */
export const apiCache = new LRUCache<string, CacheEntry>({
  max: 500,
  ttl: 5 * 60 * 1000,
  ttlAutopurge: true,
});

const DEFAULT_TTL_MS = 300_000;

export function getCached(key: string): unknown | null {
  const entry = apiCache.get(key);
  return entry?.value ?? null;
}

export function setCached(
  key: string,
  value: unknown,
  ttlMs = DEFAULT_TTL_MS,
): void {
  apiCache.set(key, { value }, { ttl: ttlMs });
}

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 60;
const UPSTREAM_MAX_REQUESTS = 30;

const rateLimitCounters = new LRUCache<string, RateLimitEntry>({
  max: 10_000,
  ttl: RATE_WINDOW_MS,
  ttlAutopurge: true,
});

function isUpstreamPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api/wc26/") ||
    pathname.startsWith("/api/pl/") ||
    pathname.startsWith("/api/ucl/") ||
    pathname.startsWith("/api/facup/") ||
    pathname.startsWith("/api/unl/") ||
    pathname.startsWith("/api/debug/")
  );
}

function maxRequestsForPath(pathname: string): number {
  return isUpstreamPath(pathname) ? UPSTREAM_MAX_REQUESTS : DEFAULT_MAX_REQUESTS;
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

export function checkRateLimit(
  ip: string,
  pathname: string,
): RateLimitResult {
  const now = Date.now();
  const upstream = isUpstreamPath(pathname);
  const maxRequests = maxRequestsForPath(pathname);
  // Keep general and upstream traffic in separate buckets. A page that loads
  // news/video/general APIs must not consume the stricter football-provider
  // allowance before its fixture requests are made.
  const counterKey = `${ip}:${upstream ? "upstream" : "general"}`;
  const entry = rateLimitCounters.get(counterKey);

  if (!entry || now > entry.resetAt) {
    rateLimitCounters.set(counterKey, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { allowed: false, retryAfterSec };
  }

  entry.count += 1;
  rateLimitCounters.set(counterKey, entry);
  return { allowed: true };
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}

/**
 * BE-005 / RSR-003 — authorize debug/diagnostic routes with DEBUG_SECRET only.
 * Never accept the cron secret via Bearer, x-cron-secret, or env fallback.
 * Fail closed when DEBUG_SECRET is unset in every environment (including development).
 */
export function authorizeDebugAccess(options: {
  debugSecret: string | undefined;
  nodeEnv: string | undefined;
  authorizationHeader: string | null;
  debugSecretHeader: string | null;
}): boolean {
  const debugSecret = options.debugSecret?.trim();
  if (!debugSecret) {
    return false;
  }

  if (options.authorizationHeader === `Bearer ${debugSecret}`) {
    return true;
  }

  return options.debugSecretHeader === debugSecret;
}

/** Gate debug/diagnostic routes behind DEBUG_SECRET only (never the cron secret). */
export function isDebugAuthorized(request: Request): boolean {
  return authorizeDebugAccess({
    debugSecret: process.env.DEBUG_SECRET,
    nodeEnv: process.env.NODE_ENV,
    authorizationHeader: request.headers.get("authorization"),
    debugSecretHeader: request.headers.get("x-debug-secret"),
  });
}

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  checkRateLimit as checkInMemoryRateLimit,
  clientIpFromRequest,
  type RateLimitResult,
} from "@/lib/server/cache";

export { clientIpFromRequest };

let upstashLimiterGeneral: Ratelimit | null | undefined;
let upstashLimiterUpstream: Ratelimit | null | undefined;

function getUpstashLimiters(): {
  general: Ratelimit | null;
  upstream: Ratelimit | null;
} {
  if (upstashLimiterGeneral !== undefined) {
    return {
      general: upstashLimiterGeneral,
      upstream: upstashLimiterUpstream ?? null,
    };
  }

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    upstashLimiterGeneral = null;
    upstashLimiterUpstream = null;
    return { general: null, upstream: null };
  }

  const redis = new Redis({ url, token });
  upstashLimiterGeneral = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    prefix: "gc:rl:general",
  });
  upstashLimiterUpstream = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "gc:rl:upstream",
  });

  return {
    general: upstashLimiterGeneral,
    upstream: upstashLimiterUpstream,
  };
}

function isUpstreamPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api/wc26/") ||
    pathname.startsWith("/api/pl/") ||
    pathname.startsWith("/api/ucl/") ||
    pathname.startsWith("/api/debug/")
  );
}

export async function checkRateLimitAsync(
  ip: string,
  pathname: string,
): Promise<RateLimitResult> {
  const { general, upstream } = getUpstashLimiters();
  const limiter = isUpstreamPath(pathname) ? upstream : general;

  if (!limiter) {
    return checkInMemoryRateLimit(ip, pathname);
  }

  const key = `${ip}:${isUpstreamPath(pathname) ? "upstream" : "general"}`;
  const result = await limiter.limit(key);

  if (result.success) {
    return { allowed: true };
  }

  const retryAfterSec = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  return { allowed: false, retryAfterSec };
}
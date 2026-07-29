export type ApiFootballErrorCode =
  | "rate_limit"
  | "network_error"
  | "unknown_error";

export class ApiFootballRateLimitError extends Error {
  constructor(message = "API-Football rate limit exceeded") {
    super(message);
    this.name = "ApiFootballRateLimitError";
  }
}

export class ApiFootballNetworkError extends Error {
  constructor(message = "API-Football network error") {
    super(message);
    this.name = "ApiFootballNetworkError";
  }
}

export class ApiFootballAuthError extends Error {
  constructor(message = "API-Football authentication error") {
    super(message);
    this.name = "ApiFootballAuthError";
  }
}

export function isQuotaErrorMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("ratelimit") ||
    lower.includes("too many requests") ||
    lower.includes("request limit") ||
    lower.includes("429")
  );
}

export function isAuthErrorMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("token") ||
    lower.includes("key") ||
    lower.includes("missing application key") ||
    lower.includes("application key missing")
  );
}

export function classifyApiFootballError(error: unknown): ApiFootballErrorCode {
  if (error instanceof ApiFootballRateLimitError) {
    return "rate_limit";
  }
  if (error instanceof ApiFootballNetworkError) {
    return "network_error";
  }
  if (error instanceof Error && isQuotaErrorMessage(error.message)) {
    return "rate_limit";
  }
  return "unknown_error";
}

export function apiFootballErrorMessage(code: ApiFootballErrorCode): string {
  switch (code) {
    case "rate_limit":
      return "Live data is temporarily unavailable due to provider rate limits.";
    case "network_error":
      return "Unable to reach the live data provider. Please try again shortly.";
    default:
      return "Unexpected error fetching live data.";
  }
}

/** Client-safe auth/provider failure text — never name env vars or key status. */
export function apiFootballClientAuthErrorMessage(): string {
  return "Live data is temporarily unavailable.";
}
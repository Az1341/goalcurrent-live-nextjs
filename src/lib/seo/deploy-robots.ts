import type { Metadata } from "next";

/**
 * Preview / local-dev deploy detection for indexing controls.
 * Production Vercel deploys (VERCEL_ENV=production) remain indexable.
 * Preview and development deploys must not be indexed.
 */
export function shouldNoIndexDeploy(
  env: {
    VERCEL_ENV?: string;
    NODE_ENV?: string;
  } = process.env,
): boolean {
  const vercelEnv = env.VERCEL_ENV;
  if (vercelEnv === "production") {
    return false;
  }
  if (vercelEnv === "preview" || vercelEnv === "development") {
    return true;
  }
  // Local `next dev` only — production-like `next start` stays indexable.
  return env.NODE_ENV === "development";
}

export function deployRobotsMetadata(
  env: {
    VERCEL_ENV?: string;
    NODE_ENV?: string;
  } = process.env,
): Pick<Metadata, "robots"> {
  if (!shouldNoIndexDeploy(env)) {
    return {};
  }
  return {
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export const PREVIEW_X_ROBOTS_TAG = "noindex, nofollow";
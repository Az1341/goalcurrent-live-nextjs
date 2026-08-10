/**
 * Pastel Match Center is a design preview surface only.
 * Allowed in local development and Vercel Preview; blocked in production.
 */
export function isPastelPreviewAllowed(env: {
  VERCEL_ENV?: string;
  NODE_ENV?: string;
} = process.env): boolean {
  if (env.VERCEL_ENV === "production") {
    return false;
  }
  if (env.NODE_ENV === "production" && !env.VERCEL_ENV) {
    return false;
  }
  return true;
}
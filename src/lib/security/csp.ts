import { REMOTE_IMAGE_HOSTNAMES } from "@/lib/images";

/**
 * Content-Security-Policy for GoalCurrent.live.
 *
 * Applied on every HTML route via src/proxy.ts (Next.js 16 middleware).
 *
 * script-src 'unsafe-inline' — Next.js bootstrap, GA/OneSignal loaders,
 * and JSON-LD blocks (type=application/ld+json).
 */
const SCRIPT_SRC = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://cdn.onesignal.com",
  "https://*.onesignal.com",
  "https://onesignal.com",
  "https://api.onesignal.com",
  "https://www.gstatic.com",
  "https://apis.google.com",
  "https://accounts.google.com",
  "https://appleid.apple.com",
  "https://vercel.live",
] as const;

const STYLE_SRC = [
  "https://cdn.onesignal.com",
  "https://*.onesignal.com",
  "https://onesignal.com",
] as const;

const IMG_SRC = [
  "blob:",
  "data:",
  "https://*.goalcurrent.live",
  "https://goalcurrent.live",
  "https://www.goalcurrent.live",
  ...REMOTE_IMAGE_HOSTNAMES.map((host) => `https://${host}`),
  "https:",
] as const;

const CONNECT_SRC = [
  "https://www.google-analytics.com",
  "https://region1.google-analytics.com",
  "https://analytics.google.com",
  "https://onesignal.com",
  "https://*.onesignal.com",
  "https://api.onesignal.com",
  "https://cdn.onesignal.com",
  "https://www.googleapis.com",
  "https://*.googleapis.com",
  "https://identitytoolkit.googleapis.com",
  "https://securetoken.googleapis.com",
  "https://fcmregistrations.googleapis.com",
  "https://firebaseinstallations.googleapis.com",
  "https://*.firebaseio.com",
  "https://*.firebaseapp.com",
  "https://*.google.com",
  "https://*.ingest.sentry.io",
  "https://www.scorebat.com",
  "https://api-football-v1.p.rapidapi.com",
] as const;

const FRAME_SRC = [
  "https://www.youtube.com",
  "https://www.scorebat.com",
  "https://*.scorebat.com",
  "https://accounts.google.com",
  "https://appleid.apple.com",
  "https://*.firebaseapp.com",
] as const;

const MEDIA_SRC = ["blob:", "https://www.sepanai.com"] as const;

function joinDirective(name: string, values: readonly string[]): string {
  return `${name} 'self' ${values.join(" ")}`.replace(/\s+/g, " ").trim();
}

export function buildContentSecurityPolicy(): string {
  const devEval =
    process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${devEval} ` + SCRIPT_SRC.join(" "),
    "style-src 'self' 'unsafe-inline' " + STYLE_SRC.join(" "),
    joinDirective("img-src", IMG_SRC),
    "font-src 'self' data:",
    joinDirective("connect-src", CONNECT_SRC),
    joinDirective("frame-src", FRAME_SRC),
    joinDirective("media-src", MEDIA_SRC),
    "worker-src 'self' blob: https://cdn.onesignal.com https://www.gstatic.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export const CONTENT_SECURITY_POLICY = buildContentSecurityPolicy();

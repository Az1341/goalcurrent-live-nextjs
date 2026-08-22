import { respondError, respondOk } from "@/lib/api/response";
import {
  getFirebaseAdminMessaging,
  isFirebaseAdminConfigured,
} from "@/lib/firebase/admin";
import { buildDueFavouriteTeamAlerts } from "@/lib/server/favourite-team-alerts";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV === "development";
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;
  return request.headers.get("x-cron-secret") === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return respondError("unauthorized", "Unauthorized.", 401);
  }

  const now = Date.now();
  const alerts = buildDueFavouriteTeamAlerts(now);
  if (alerts.length === 0) {
    return respondOk({
      checkedAt: new Date(now).toISOString(),
      due: 0,
      sent: 0,
    });
  }

  if (!isFirebaseAdminConfigured()) {
    return respondError(
      "firebase_admin_not_configured",
      "Push notifications are not configured.",
      503,
      { due: alerts.length, sent: 0 },
    );
  }

  const messaging = getFirebaseAdminMessaging();
  if (!messaging) {
    return respondError(
      "firebase_admin_unavailable",
      "Firebase admin is unavailable.",
      503,
      { due: alerts.length, sent: 0 },
    );
  }

  let sent = 0;
  const failures: string[] = [];
  for (const alert of alerts) {
    try {
      const dedupeTag = `gc-${alert.fixtureKey.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
      await messaging.send({
        topic: alert.topic,
        notification: {
          title: alert.title,
          body: alert.body,
        },
        data: {
          fixtureKey: alert.fixtureKey,
          teamKey: alert.teamKey,
          href: alert.href,
          kickoffUtc: alert.kickoffUtc,
        },
        webpush: {
          headers: {
            TTL: "5400",
            Topic: dedupeTag,
          },
          notification: {
            tag: dedupeTag,
            renotify: false,
          },
          fcmOptions: {
            link: absoluteUrl(alert.href),
          },
        },
      });
      sent += 1;
    } catch (error) {
      console.error("[cron/favourite-team-alerts] send failed", {
        fixtureKey: alert.fixtureKey,
        teamKey: alert.teamKey,
        error,
      });
      failures.push(`${alert.teamKey}:${alert.fixtureKey}`);
    }
  }

  if (failures.length > 0) {
    return respondError(
      "partial_send_failure",
      "One or more favourite-team alerts failed.",
      502,
      {
        checkedAt: new Date(now).toISOString(),
        due: alerts.length,
        sent,
        failed: failures.length,
      },
    );
  }

  return respondOk({
    checkedAt: new Date(now).toISOString(),
    due: alerts.length,
    sent,
  });
}

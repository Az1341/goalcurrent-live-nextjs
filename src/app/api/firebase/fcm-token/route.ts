import { NextResponse } from "next/server";
import {
  getFirebaseAdminAuth,
  getFirebaseAdminMessaging,
  isFirebaseAdminConfigured,
} from "@/lib/firebase/admin";
import { parseJsonBody, respondError, respondOk } from "@/lib/api/response";
import {
  isKnownFavouriteTeamKey,
  teamTopicForFavouriteKey,
} from "@/lib/favourite-entities";
import { fcmTokenBodySchema } from "@/lib/validation/schemas";

/** Require a non-empty Firebase ID token before any topic subscribe (BE-007). */
export function requireFcmIdToken(
  idToken: string | undefined,
):
  | { ok: true; idToken: string }
  | { ok: false; response: NextResponse } {
  const trimmed = idToken?.trim();
  if (!trimmed) {
    return {
      ok: false,
      response: respondError(
        "missing_id_token",
        "Firebase ID token is required.",
        401,
      ),
    };
  }
  return { ok: true, idToken: trimmed };
}

function validTeamTopics(teamKeys: readonly string[]): Map<string, string> {
  const topics = new Map<string, string>();
  for (const teamKey of teamKeys) {
    if (!isKnownFavouriteTeamKey(teamKey)) continue;
    const topic = teamTopicForFavouriteKey(teamKey);
    if (topic) topics.set(teamKey, topic);
  }
  return topics;
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, fcmTokenBodySchema);
  if ("error" in parsed) {
    return parsed.error;
  }

  const {
    token,
    locale,
    idToken: rawIdToken,
    teamKeys,
    previousTeamKeys,
  } = parsed.data;

  const required = requireFcmIdToken(rawIdToken);
  if (!required.ok) {
    return required.response;
  }

  if (!isFirebaseAdminConfigured()) {
    return respondError(
      "firebase_admin_not_configured",
      "Push notifications are not configured.",
      503,
    );
  }

  const auth = getFirebaseAdminAuth();
  const messaging = getFirebaseAdminMessaging();
  if (!auth || !messaging) {
    return respondError(
      "firebase_admin_unavailable",
      "Firebase admin is unavailable.",
      503,
    );
  }

  let uid: string;
  try {
    const decoded = await auth.verifyIdToken(required.idToken);
    uid = decoded.uid;
  } catch {
    return respondError("invalid_id_token", "Invalid Firebase ID token.", 401);
  }

  const baseTopics = ["goalcurrent-live", `user-${uid}`];
  if (locale) {
    baseTopics.push(`lang-${locale}`);
  }

  const currentTeamTopics = validTeamTopics(teamKeys);
  const previousTeamTopics = validTeamTopics(previousTeamKeys);
  const removedTopics = [...previousTeamTopics.entries()]
    .filter(([teamKey]) => !currentTeamTopics.has(teamKey))
    .map(([, topic]) => topic);

  try {
    await Promise.all([
      ...baseTopics.map((topic) => messaging.subscribeToTopic(token, topic)),
      ...[...currentTeamTopics.values()].map((topic) =>
        messaging.subscribeToTopic(token, topic),
      ),
      ...removedTopics.map((topic) => messaging.unsubscribeFromTopic(token, topic)),
    ]);
  } catch (error) {
    console.error("[firebase/fcm-token] subscribe failed", error);
    return respondError(
      "subscribe_failed",
      "Failed to subscribe device to topics.",
      502,
    );
  }

  return respondOk({
    topics: baseTopics,
    teamTopics: [...currentTeamTopics.values()],
    removedTeamTopics: removedTopics,
    authenticated: true,
  });
}

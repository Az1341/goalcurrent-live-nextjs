"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { readFavourites } from "@/lib/favourites";
import {
  isFirebaseMessagingConfigured,
} from "@/lib/firebase/config";
import {
  getFirebaseAuth,
  registerFcmServiceWorker,
  requestFcmToken,
} from "@/lib/firebase/client";

export const FCM_TOKEN_STORAGE_KEY = "gc:fcm-token-registered";
const FCM_TEAM_KEYS_STORAGE_KEY = "gc:fcm-team-keys";

function readStoredTeamKeys(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FCM_TEAM_KEYS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

async function syncFcmToken(
  token: string,
  locale: string,
  idToken?: string,
  teamKeys: string[] = [],
  previousTeamKeys: string[] = [],
): Promise<boolean> {
  try {
    const response = await fetch("/api/firebase/fcm-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        locale,
        idToken,
        teamKeys,
        previousTeamKeys,
      }),
    });
    if (!response.ok) {
      console.warn("[FCM] token sync skipped:", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[FCM] token sync failed", error);
    return false;
  }
}

export function FcmRegistration() {
  const locale = useLocale();
  const { user } = useFirebaseAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (!isFirebaseMessagingConfigured() || typeof window === "undefined") {
      return;
    }
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const register = useCallback(async () => {
    if (!isFirebaseMessagingConfigured() || typeof window === "undefined") {
      return;
    }

    if (!("Notification" in window)) {
      return;
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);
    if (nextPermission !== "granted") {
      return;
    }

    const registration = await registerFcmServiceWorker();
    if (!registration) {
      return;
    }

    const token = await requestFcmToken(registration);
    if (!token) {
      return;
    }

    const auth = getFirebaseAuth();
    const idToken = auth?.currentUser
      ? await auth.currentUser.getIdToken()
      : undefined;
    const teamKeys = readFavourites().teamNotifications;
    const previousTeamKeys = readStoredTeamKeys();

    const synced = await syncFcmToken(
      token,
      locale,
      idToken,
      teamKeys,
      previousTeamKeys,
    );
    if (!synced) return;

    window.localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
    window.localStorage.setItem(
      FCM_TEAM_KEYS_STORAGE_KEY,
      JSON.stringify(teamKeys),
    );
    window.AndroidBridge?.onFcmToken?.(token);
  }, [locale]);

  useEffect(() => {
    if (!isFirebaseMessagingConfigured()) {
      return;
    }

    const stored = window.localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
    if (permission === "granted" && stored) {
      void register();
      return;
    }

    if (permission === "granted") {
      void register();
    }
  }, [permission, user, register]);

  useEffect(() => {
    const handler = () => {
      void register();
    };
    window.addEventListener("gc:firebase-enable-push", handler);
    window.addEventListener("gc:favourites-change", handler);
    return () => {
      window.removeEventListener("gc:firebase-enable-push", handler);
      window.removeEventListener("gc:favourites-change", handler);
    };
  }, [register]);

  return null;
}

export function requestFirebasePushPermission() {
  window.dispatchEvent(new CustomEvent("gc:firebase-enable-push"));
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
}

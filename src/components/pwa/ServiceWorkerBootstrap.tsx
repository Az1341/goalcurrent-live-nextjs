"use client";

import { useEffect } from "react";

const GOALCURRENT_CACHE_PREFIX = "goalcurrent-online-";

function isGoalCurrentAppShellRegistration(registration: ServiceWorkerRegistration) {
  const workers = [
    registration.active,
    registration.waiting,
    registration.installing,
  ].filter(Boolean) as ServiceWorker[];

  return workers.some((worker) => {
    try {
      return new URL(worker.scriptURL).pathname === "/sw.js";
    } catch {
      return false;
    }
  });
}

/**
 * Retires the old GoalCurrent app-shell service worker after the v15 cleanup
 * worker has removed stale WC26 caches. The Android TWA then behaves as a thin
 * shell over the current responsive website instead of maintaining a separate
 * cached application experience.
 */
export function ServiceWorkerBootstrap() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const retireLegacyAppShell = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations
            .filter(isGoalCurrentAppShellRegistration)
            .map((registration) => registration.unregister()),
        );
      } catch {}

      try {
        if (!("caches" in window)) return;
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter((name) => name.startsWith(GOALCURRENT_CACHE_PREFIX))
            .map((name) => caches.delete(name)),
        );
      } catch {}
    };

    void retireLegacyAppShell();
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

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
 * Final client-side retirement for the historical GoalCurrent app-shell worker.
 * The installed Android app must use the current responsive website directly.
 */
export function ServiceWorkerBootstrap() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const retireLegacyAppShell = async () => {
      let appShellRegistrations: ServiceWorkerRegistration[] = [];

      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        appShellRegistrations = registrations.filter(
          isGoalCurrentAppShellRegistration,
        );

        // Ask any surviving /sw.js registration to check the no-cache network
        // script before retirement. This lets the v16 cleanup worker purge
        // clients that are still controlled by an older cached shell.
        await Promise.all(
          appShellRegistrations.map((registration) =>
            registration.update().catch(() => undefined),
          ),
        );
      } catch {}

      try {
        if ("caches" in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
        }
      } catch {}

      try {
        await Promise.all(
          appShellRegistrations.map((registration) =>
            registration.unregister().catch(() => false),
          ),
        );
      } catch {}

      // If an Android standalone client somehow reaches current code while still
      // sitting on a historical WC26 URL, move it to the current home after the
      // caches/worker have been retired. Normal web archive visits remain intact.
      try {
        const isAndroid = /Android/i.test(window.navigator.userAgent);
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
        const isGoalCurrentTwa = document.referrer.startsWith(
          "android-app://com.goalcurrent.app",
        );
        const isWc26Path = /^\/(?:[a-z]{2}\/)?worldcup2026(?:\/.*)?$/i.test(
          window.location.pathname,
        );

        if (isWc26Path && (isGoalCurrentTwa || (isAndroid && isStandalone))) {
          window.location.replace("/");
        }
      } catch {}
    };

    void retireLegacyAppShell();
  }, []);

  return null;
}

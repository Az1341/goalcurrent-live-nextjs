"use client";

import { useEffect } from "react";

const CLEANUP_VERSION = "16";
const CLEANUP_MARKER = `gc-pwa-cleanup-v${CLEANUP_VERSION}`;
const REFRESH_PARAM = "gc_app_refresh";

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

function isAndroidAppContext() {
  const isAndroid = /Android/i.test(window.navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const isGoalCurrentTwa = document.referrer.startsWith(
    "android-app://com.goalcurrent.app",
  );
  return isGoalCurrentTwa || (isAndroid && isStandalone);
}

/**
 * Migrates already-installed WC26-era app shells to the current website.
 * Existing /sw.js registrations are updated before retirement so stale
 * controlled clients actually receive the cleanup worker.
 */
export function ServiceWorkerBootstrap() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const url = new URL(window.location.href);
    if (url.searchParams.get(REFRESH_PARAM) === CLEANUP_VERSION) {
      try {
        window.localStorage.setItem(CLEANUP_MARKER, "1");
      } catch {}
      url.searchParams.delete(REFRESH_PARAM);
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      return;
    }

    try {
      if (window.localStorage.getItem(CLEANUP_MARKER) === "1") return;
    } catch {}

    const migrateLegacyAppShell = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const appShellRegistrations = registrations.filter(
          isGoalCurrentAppShellRegistration,
        );

        if (appShellRegistrations.length > 0) {
          await Promise.all(
            appShellRegistrations.map((registration) => registration.update()),
          );
          return;
        }

        // Ordinary website visitors never receive a new service worker. A
        // published Android standalone/TWA shell may bootstrap one migration
        // pass when its old registration has already disappeared.
        if (isAndroidAppContext()) {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            updateViaCache: "none",
          });
          await registration.update();
        }
      } catch {}
    };

    void migrateLegacyAppShell();
  }, []);

  return null;
}

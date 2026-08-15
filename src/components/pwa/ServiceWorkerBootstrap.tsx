"use client";

import { useEffect } from "react";
import { attachServiceWorkerForegroundUpdate } from "@/lib/pwa/sw-foreground-update";

/**
 * Registers the app-shell service worker independently of analytics consent.
 *
 * A service-worker update must never forcibly reload the page while a visitor
 * is using GoalCurrent. The newly activated worker can control subsequent
 * requests and the latest application shell will be picked up naturally on
 * the next navigation or user-initiated refresh.
 */
export function ServiceWorkerBootstrap() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    if (window.__gc_sw_registered) {
      return;
    }

    window.__gc_sw_registered = true;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        attachServiceWorkerForegroundUpdate(registration, {
          document,
          window,
        });
      })
      .catch(() => {});
  }, []);

  return null;
}

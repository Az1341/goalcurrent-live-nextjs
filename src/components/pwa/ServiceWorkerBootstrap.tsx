"use client";

import { useEffect } from "react";
import { attachServiceWorkerControllerReload } from "@/lib/pwa/sw-controller-reload";
import { attachServiceWorkerForegroundUpdate } from "@/lib/pwa/sw-foreground-update";

/**
 * Registers the app-shell service worker independently of analytics consent.
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
    // Reload once when a new SW takes control (skipWaiting + clients.claim).
    // Listener stays for the page lifetime; __gc_sw_registered prevents doubles.
    attachServiceWorkerControllerReload(navigator.serviceWorker, () => {
      window.location.reload();
    });
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
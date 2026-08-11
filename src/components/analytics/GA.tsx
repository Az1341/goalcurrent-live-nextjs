"use client";

import Script from "next/script";
import { Suspense, useEffect, useSyncExternalStore } from "react";
import {
  COOKIE_CONSENT_ACCEPTED,
  COOKIE_CONSENT_KEY,
} from "@/lib/site-keys";
import {
  GA_MEASUREMENT_ID,
  shouldEnableAnalytics,
} from "@/lib/analytics";
import { attachServiceWorkerControllerReload } from "@/lib/pwa/sw-controller-reload";
import { attachServiceWorkerForegroundUpdate } from "@/lib/pwa/sw-foreground-update";
import AnalyticsRouteListener from "@/components/analytics/AnalyticsRouteListener";

const CONSENT_EVENT = "gc:cookie-consent-change";

function subscribeConsent(onStoreChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onStoreChange);
  return () => window.removeEventListener(CONSENT_EVENT, onStoreChange);
}

function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === COOKIE_CONSENT_ACCEPTED;
  } catch {
    return false;
  }
}

function AnalyticsScripts() {
  const hostname = useSyncExternalStore(
    () => () => {},
    () => window.location.hostname,
    () => "",
  );
  const consent = useSyncExternalStore(
    subscribeConsent,
    hasAnalyticsConsent,
    () => false,
  );

  const enabled =
    consent && Boolean(GA_MEASUREMENT_ID) && shouldEnableAnalytics(hostname);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if ("serviceWorker" in navigator) {
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
    }
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          if (!window.__gc_gtag_init) {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            window.__gc_gtag_init = true;
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              send_page_view: false,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });
          }
        `}
      </Script>
      <Suspense fallback={null}>
        <AnalyticsRouteListener />
      </Suspense>
    </>
  );
}

export function GA() {
  return <AnalyticsScripts />;
}

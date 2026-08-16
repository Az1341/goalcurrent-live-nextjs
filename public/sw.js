// GoalCurrent.live — one-time PWA/TWA stale-shell retirement worker.
// This worker exists only to remove historical cached application shells from
// installed Android/PWA clients. It deliberately installs no fetch handler.
const CLEANUP_VERSION = "16";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // The final cleanup must not assume an old cache-name prefix. Delete every
      // Cache Storage entry for this origin so a legacy WC26 shell cannot survive
      // under an unexpected historical cache name.
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      await self.clients.claim();

      // Reload only clients that can visibly remain trapped in the old shell.
      // The cleanup worker has no fetch handler, so these navigations go to the
      // current network application after caches have been purged.
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      await Promise.all(
        windows.map((client) => {
          const url = new URL(client.url);
          if (url.origin !== self.location.origin) return undefined;

          const staleShellPath =
            url.pathname === "/" ||
            /^\/(?:en|es|it|de|fr|nl)?\/?worldcup2026(?:\/.*)?$/i.test(
              url.pathname,
            );

          return staleShellPath ? client.navigate("/") : undefined;
        }),
      );

      // The installed Android app must now behave as a thin shell over the live
      // responsive site. Remove this root-scope worker after the one-time purge.
      await self.registration.unregister();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Intentionally no fetch event: navigation, Next.js assets and APIs must come
// from the current website/network rather than a persistent application cache.
void CLEANUP_VERSION;

// GoalCurrent.live — one-time PWA/TWA cleanup worker.
// The installed Android app must mirror the live responsive website and must
// never serve a cached World Cup-era application shell.
const CLEANUP_VERSION = "15";
const GOALCURRENT_CACHE_PREFIX = "goalcurrent-online-";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith(GOALCURRENT_CACHE_PREFIX))
          .map((name) => caches.delete(name)),
      );

      await self.clients.claim();

      // Refresh already-open GoalCurrent windows once after the stale cache is
      // purged. No fetch handler is installed, so every later navigation,
      // Next.js asset and API request goes directly to the current website.
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      await Promise.all(
        windows.map((client) => {
          const url = new URL(client.url);
          if (url.origin !== self.location.origin) return undefined;
          const legacyArchiveHub = /^\/(?:en|es|it|de|fr|nl\/)?worldcup2026\/?$/i.test(
            url.pathname,
          );
          return client.navigate(legacyArchiveHub ? "/" : url.href);
        }),
      );
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Intentionally no fetch event: Android/PWA traffic must use the same live
// network responses as the mobile website.
void CLEANUP_VERSION;

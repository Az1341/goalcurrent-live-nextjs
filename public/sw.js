// GoalCurrent.live — one-time PWA/TWA cleanup worker.
// Version 16 is an emergency migration for already-installed WC26-era shells.
// It deliberately has no fetch handler: after activation all app traffic uses
// the same live network responses as the responsive website.
const CLEANUP_VERSION = "16";
const GOALCURRENT_CACHE_PREFIX = "goalcurrent-online-";
const REFRESH_PARAM = "gc_app_refresh";

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

      // Take control before retiring the registration so every currently-open
      // WC26-era client stops using the old fetch handler immediately.
      await self.clients.claim();

      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // This worker is migration-only. Once the stale caches are gone, remove
      // the registration itself so GoalCurrent cannot maintain a second cached
      // application shell beside the website.
      await self.registration.unregister();

      const refreshUrl = new URL("/", self.location.origin);
      refreshUrl.searchParams.set(REFRESH_PARAM, CLEANUP_VERSION);

      await Promise.all(
        windows.map((client) => {
          try {
            return client.navigate(refreshUrl.href);
          } catch {
            return undefined;
          }
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

// Intentionally no fetch event. The installed Android app is a thin shell over
// the current responsive website after this one-time migration.
void CLEANUP_VERSION;

// GoalCurrent.live — Service Worker (PWA/TWA freshness layer)
// CACHE_VERSION must change whenever shell/product chrome changes.
const CACHE_VERSION = "14";
const STATIC_CACHE = `goalcurrent-online-static-v${CACHE_VERSION}`;
const API_CACHE = `goalcurrent-online-api-v${CACHE_VERSION}`;

const LOCALES = ["en", "es", "it", "de", "fr", "nl"];

const OFFLINE_COPY = {
  en: "You are offline. Check your connection to see current live football scores.",
  fr: "Vous êtes hors ligne. Vérifiez votre connexion pour voir les scores de football en direct.",
  de: "Sie sind offline. Prüfen Sie Ihre Verbindung, um aktuelle Live-Fußballergebnisse zu sehen.",
  nl: "Je bent offline. Controleer je verbinding om actuele live voetbalscores te bekijken.",
  es: "Estás sin conexión. Comprueba tu conexión para ver los resultados actuales de fútbol en directo.",
  it: "Sei offline. Controlla la connessione per vedere i risultati di calcio live aggiornati.",
};

const STATIC_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/logo.svg",
  "/sepanai-mark.svg",
  "/famvi-wordmark-inline.svg",
];

function isLocalDevHost(hostname) {
  return hostname === "localhost" || hostname.endsWith(".localhost");
}

function localeFromPathname(pathname) {
  const segment = pathname.split("/").filter(Boolean)[0];
  return LOCALES.includes(segment) ? segment : "en";
}

function localeHomePath(locale) {
  return locale === "en" ? "/" : `/${locale}`;
}

function offlineHtmlForRequest(request) {
  const url = new URL(request.url);
  const locale = localeFromPathname(url.pathname);
  const description = OFFLINE_COPY[locale] || OFFLINE_COPY.en;
  const home = localeHomePath(locale);

  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#5c0a1a"><title>GoalCurrent — Offline</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fff;color:#1d1d1f;font-family:system-ui,sans-serif;padding:24px;text-align:center}.card{max-width:420px}h1{margin:0 0 12px}p{line-height:1.5;color:#5f6368}a{display:inline-block;margin-top:12px;color:#c8102e;font-weight:700}</style></head><body><div class="card"><h1>GoalCurrent</h1><p>${description}</p><a href="${home}">Try again</a></div></body></html>`;
}

async function cacheResponse(cacheName, request, response) {
  if (!response || !response.ok) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
}

// Navigations are intentionally network-only. The installed Android TWA must
// mirror the current responsive website and must never revive an old WC26 HTML shell.
async function networkOnlyNavigation(request) {
  try {
    return await fetch(request, { cache: "no-store" });
  } catch {
    return new Response(offlineHtmlForRequest(request), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

async function staleWhileRevalidateAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then(async (response) => {
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  if (cached) {
    void refresh;
    return cached;
  }
  return (await refresh) || new Response("Offline", { status: 503 });
}

async function cacheFirstAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) await cacheResponse(STATIC_CACHE, request, response);
    return response;
  } catch {
    return new Response("Offline — asset not cached", { status: 503 });
  }
}

async function networkFirstApi(request, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(request, { signal: controller.signal, cache: "no-store" });
    clearTimeout(timer);
    if (response.ok) await cacheResponse(API_CACHE, request, response);
    return response;
  } catch {
    clearTimeout(timer);
    const cache = await caches.open(API_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE);
      await Promise.allSettled(STATIC_ASSETS.map((url) => staticCache.add(url)));
    })(),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const currentCaches = new Set([STATIC_CACHE, API_CACHE]);
      const staleGoalCurrentCaches = cacheNames.filter(
        (name) => name.startsWith("goalcurrent-online-") && !currentCaches.has(name),
      );

      await Promise.all(staleGoalCurrentCaches.map((name) => caches.delete(name)));

      if (isLocalDevHost(self.location.hostname)) {
        await Promise.all((await caches.keys()).map((name) => caches.delete(name)));
        await self.registration.unregister();
        return;
      }

      await self.clients.claim();

      // One-time migration from the World Cup-era cached app shell. Existing
      // installed-app home/archive windows are refreshed once after stale caches
      // are removed, then all later navigations remain network-backed.
      if (staleGoalCurrentCaches.length > 0) {
        const windows = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });
        await Promise.all(
          windows.map((client) => {
            const url = new URL(client.url);
            if (url.origin !== self.location.origin) return undefined;
            const isHome = url.pathname === "/" || /^\/(?:en|es|it|de|fr|nl)\/?$/.test(url.pathname);
            const isLegacyWc26 = /^\/(?:en|es|it|de|fr|nl\/)?worldcup2026\/?$/i.test(url.pathname);
            if (!isHome && !isLegacyWc26) return undefined;
            return client.navigate("/");
          }),
        );
      }
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || isLocalDevHost(url.hostname)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkOnlyNavigation(request));
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstApi(request, 5000));
    return;
  }

  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(staleWhileRevalidateAsset(request));
    return;
  }

  if (
    url.pathname.startsWith("/flags/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(cacheFirstAsset(request));
  }
});

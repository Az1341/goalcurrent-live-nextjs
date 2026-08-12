// GoalCurrent.live — Service Worker (PWA app shell)
// Bump CACHE_VERSION when changing cache strategy so activate purges stale shells.
const CACHE_VERSION = "10";
const STATIC_CACHE = `goalcurrent-online-static-v${CACHE_VERSION}`;
const SHELL_CACHE = `goalcurrent-online-shell-v${CACHE_VERSION}`;
const API_CACHE = "goalcurrent-online-api-v1";

const LOCALES = ["en", "es", "it", "de", "fr", "nl"];
const RTL_LOCALES = new Set([]);

const OFFLINE_COPY = {
  en: {
    title: "GoalCurrent",
    description:
      "You are offline. Check your connection to see live World Cup scores.",
    tryAgain: "Try again",
  },
  fr: {
    title: "GoalCurrent",
    description:
      "Vous êtes hors ligne. Vérifiez votre connexion pour voir les scores en direct de la Coupe du monde.",
    tryAgain: "Réessayer",
  },
  de: {
    title: "GoalCurrent",
    description:
      "Sie sind offline. Prüfen Sie Ihre Verbindung, um Live-Ergebnisse der WM zu sehen.",
    tryAgain: "Erneut versuchen",
  },
  nl: {
    title: "GoalCurrent",
    description:
      "Je bent offline. Controleer je verbinding om live WK-scores te bekijken.",
    tryAgain: "Opnieuw proberen",
  },
  es: {
    title: "GoalCurrent",
    description:
      "Estás sin conexión. Comprueba tu conexión para ver los resultados en vivo del Mundial.",
    tryAgain: "Reintentar",
  },
  it: {
    title: "GoalCurrent",
    description:
      "Sei offline. Controlla la connessione per vedere i risultati live del Mondiale.",
    tryAgain: "Riprova",
  },
};

const STATIC_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/logo.svg",
];

const SHELL_URLS = ["/"];

function isLocalDevHost(hostname) {
  return hostname === "localhost" || hostname.endsWith(".localhost");
}

function localeFromPathname(pathname) {
  const segment = pathname.split("/").filter(Boolean)[0];
  return LOCALES.includes(segment) && segment !== "en" ? segment : "en";
}

function localeHomePath(locale) {
  return locale === "en" ? "/" : `/${locale}`;
}

function isAppShellPath(pathname) {
  if (pathname === "/") return true;
  const parts = pathname.split("/").filter(Boolean);
  return parts.length === 1 && LOCALES.includes(parts[0]);
}

function offlineHtmlForRequest(request) {
  const url = new URL(request.url);
  const locale = localeFromPathname(url.pathname);
  const copy = OFFLINE_COPY[locale] || OFFLINE_COPY.en;
  const dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
  const home = localeHomePath(locale);

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head><meta charset="UTF-8"><title>${copy.title} — Offline</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#5c0a1a">
<style>
  body{margin:0;background:#5c0a1a;color:#fff;font-family:sans-serif;
    display:flex;flex-direction:column;align-items:center;
    justify-content:center;min-height:100vh;text-align:center;padding:20px}
  h1{color:#f5c6ce;font-size:2rem}
  p{color:#f0d4d8;max-width:300px}
  a{color:#f5c6ce;text-decoration:none;margin-top:20px;display:inline-block}
</style></head>
<body>
  <h1>${copy.title}</h1>
  <p>${copy.description}</p>
  <a href="${home}">${copy.tryAgain}</a>
</body></html>`;
}

async function cacheNextStaticAssetsFromHtml(response) {
  try {
    const text = await response.text();
    const matches = text.match(/\/_next\/static\/[^"'\s)]+/g) || [];
    const urls = [...new Set(matches)];
    if (urls.length === 0) return;

    const staticCache = await caches.open(STATIC_CACHE);
    await Promise.allSettled(
      urls.map((path) =>
        staticCache.add(new URL(path, self.location.origin).href).catch(() => {
          /* chunk may 404 on partial deploy */
        }),
      ),
    );
  } catch {
    /* ignore parse failures */
  }
}

async function staleWhileRevalidateShell(request) {
  const shellCache = await caches.open(SHELL_CACHE);
  const cached = await shellCache.match(request);

  const refresh = fetch(request)
    .then(async (response) => {
      if (!response.ok) return response;
      await shellCache.put(request, response.clone());
      void cacheNextStaticAssetsFromHtml(response.clone());
      return response;
    })
    .catch(() => null);

  if (cached) {
    void refresh;
    return cached;
  }

  const fresh = await refresh;
  if (fresh) return fresh;

  const rootFallback = await shellCache.match("/");
  if (rootFallback) return rootFallback;

  return new Response(offlineHtmlForRequest(request), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function staleWhileRevalidateAsset(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const refresh = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    void refresh;
    return cached;
  }

  const fresh = await refresh;
  if (fresh) return fresh;
  return new Response("Offline", { status: 503 });
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE);
      await Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          staticCache.add(url).catch(() => {
            /* optional asset */
          }),
        ),
      );

      const shellCache = await caches.open(SHELL_CACHE);
      await Promise.allSettled(
        SHELL_URLS.map((url) =>
          shellCache.add(url).catch(() => {
            /* shell may fail on first install offline */
          }),
        ),
      );
    })(),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (isLocalDevHost(self.location.hostname)) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: "window" });
        await Promise.all(
          clients.map((client) =>
            "navigate" in client ? client.navigate(client.url) : undefined,
          ),
        );
        return;
      }

      const activeCaches = new Set([STATIC_CACHE, SHELL_CACHE, API_CACHE]);
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith("goalcurrent-online-") && !activeCaches.has(name),
          )
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

function isPublicStaticAsset(pathname) {
  return (
    pathname.startsWith("/flags/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/logo.svg" ||
    pathname === "/favicon.ico" ||
    pathname === "/favicon.svg"
  );
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;
  if (url.origin !== location.origin) return;
  if (isLocalDevHost(url.hostname)) return;

  // Never cache-intercept flags, photos, or logos — always load fresh from network.
  if (isPublicStaticAsset(url.pathname)) {
    return;
  }

  if (event.request.mode === "navigate") {
    if (isAppShellPath(url.pathname)) {
      event.respondWith(staleWhileRevalidateShell(event.request));
    } else {
      event.respondWith(
        fetch(event.request).catch(async () => {
          const shellCache = await caches.open(SHELL_CACHE);
          return (
            (await shellCache.match(event.request)) ||
            (await shellCache.match("/")) ||
            new Response(offlineHtmlForRequest(event.request), {
              status: 200,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            })
          );
        }),
      );
    }
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstWithTimeout(event.request, 5000));
    return;
  }

  const accept = event.request.headers.get("accept") || "";
  if (accept.includes("text/html")) {
    event.respondWith(networkFirstHTML(event.request));
    return;
  }

  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(staleWhileRevalidateAsset(event.request, STATIC_CACHE));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline — asset not cached", { status: 503 });
  }
}

async function networkFirstHTML(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request, { cacheName: SHELL_CACHE });
    if (cached) return cached;
    return new Response(offlineHtmlForRequest(request), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

async function networkFirstWithTimeout(request, timeout) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request, { cacheName: API_CACHE });
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

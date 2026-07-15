/*
 * Charge Finder service worker (hand-rolled, no build-step dependency).
 *
 * Responsibilities:
 *  - Make the app installable + launchable offline by caching the SPA shell.
 *  - Serve the last-known "nearby stations" response when the network is down.
 *  - Cache hashed build assets and map tiles so repeat/offline loads are fast.
 *
 * Strategy per request kind:
 *  - navigations      -> network-first, fall back to cached shell, then offline.html
 *  - GET /stations    -> network-first, fall back to the last cached list (offline)
 *  - map tiles        -> cache-first with an LRU cap (tiles are immutable per z/x/y)
 *  - same-origin asset -> stale-while-revalidate (hashed filenames self-bust)
 *  - everything else  -> passthrough (never cache auth/mutating/other API calls)
 *
 * Live availability (/stations/:id/availability) and single-station detail are
 * intentionally NOT cached here — the backend marks availability `no-store`, and
 * stale port counts would be worse than a failed poll.
 */

const VERSION = "v1";
const SHELL_CACHE = `cf-shell-${VERSION}`;
const ASSETS_CACHE = `cf-assets-${VERSION}`;
const TILES_CACHE = `cf-tiles-${VERSION}`;
const STATIONS_CACHE = `cf-stations-${VERSION}`;
const CURRENT_CACHES = new Set([
  SHELL_CACHE,
  ASSETS_CACHE,
  TILES_CACHE,
  STATIONS_CACHE,
]);

// Bounds so runtime caches can't grow without limit on a long-lived install.
const MAX_TILES = 350;
const MAX_STATION_ENTRIES = 60;

// App-shell resources at stable (non-hashed) URLs. Hashed JS/CSS are cached at
// runtime instead — their names aren't known here at build time.
const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/app-logo.svg",
  "/icon-192.png",
  "/icon-512.png",
];

const STATIC_DESTINATIONS = new Set([
  "script",
  "style",
  "image",
  "font",
  "manifest",
]);

// ---------------------------------------------------------------------------
// Request classifiers
// ---------------------------------------------------------------------------

const isNavigationRequest = (request) => request.mode === "navigate";

// The public nearby-stations list: pathname ends in `/stations` (covers both a
// same-origin `/api/stations` and a cross-origin backend `.../api/stations`).
// Excludes `/stations/:id` and `/stations/:id/availability`, which end elsewhere.
const isStationsListRequest = (request, url) =>
  request.method === "GET" && /\/stations\/?$/.test(url.pathname);

const isMapTile = (url) => {
  const host = url.hostname;
  return host === "api.maptiler.com" || /(^|\.)tile\.openstreetmap\.org$/.test(host);
};

const isStaticAsset = (request, url) => {
  if (url.origin !== self.location.origin) return false;
  if (STATIC_DESTINATIONS.has(request.destination)) return true;
  return /\.(?:js|mjs|css|woff2?|ttf|otf|png|jpe?g|gif|svg|webp|ico|json|txt|map)$/i.test(
    url.pathname,
  );
};

const isCacheableResponse = (response) =>
  Boolean(response) && response.ok && response.type !== "opaque";

// ---------------------------------------------------------------------------
// LRU trim: Cache.keys() preserves insertion order, so the oldest entries are
// first. Delete from the front until we're back under the cap.
// ---------------------------------------------------------------------------

const trimCache = async (cacheName, maxEntries) => {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length <= maxEntries) return;
    const excess = keys.length - maxEntries;
    await Promise.all(keys.slice(0, excess).map((key) => cache.delete(key)));
  } catch {
    // best-effort
  }
};

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

// Network-first; the SPA shell (index.html) backs every route when offline.
const handleNavigation = async (request) => {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (response.ok && contentType.includes("text/html")) {
      // Keep the shell fresh so offline navigations get the latest deploy.
      cache.put("/index.html", response.clone()).catch(() => {});
    }
    return response;
  } catch {
    return (
      (await cache.match("/index.html")) ||
      (await cache.match("/offline.html")) ||
      (await cache.match("/")) ||
      new Response("You are offline.", {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      })
    );
  }
};

// Network-first with a cached fallback so the map still shows the last stations
// you loaded while offline. On a total miss we return an empty 503 so the app's
// own last-known cache (localStorage) can take over.
const handleStationsList = async (request) => {
  const cache = await caches.open(STATIONS_CACHE);
  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      cache.put(request, response.clone()).then(
        () => trimCache(STATIONS_CACHE, MAX_STATION_ENTRIES),
        () => {},
      );
    }
    return response;
  } catch {
    const cached = await cache.match(request, { ignoreVary: true });
    if (cached) return cached;
    return new Response(JSON.stringify({ stations: [], offline: true }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Cache-first: a given z/x/y tile never changes. Opaque (no-cors <img>) tiles are
// cached too — we can't read their status, but stale tiles beat blank ones.
const handleMapTile = async (request) => {
  const cache = await caches.open(TILES_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === "opaque")) {
      cache.put(request, response.clone()).then(
        () => trimCache(TILES_CACHE, MAX_TILES),
        () => {},
      );
    }
    return response;
  } catch {
    return cached || Response.error();
  }
};

// Stale-while-revalidate for build assets: serve cache instantly, refresh in the
// background. Vite's content-hashed filenames mean an updated asset is a new URL.
const handleStaticAsset = async (request) => {
  const cache = await caches.open(ASSETS_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (isCacheableResponse(response)) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch(() => undefined);
  return cached || (await network) || Response.error();
};

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Precache individually so one 404 can't abort the whole install.
      await Promise.allSettled(
        SHELL_ASSETS.map((asset) =>
          cache.add(new Request(asset, { cache: "reload" })),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("cf-") && !CURRENT_CACHES.has(name))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  if (isNavigationRequest(request)) {
    event.respondWith(handleNavigation(request));
    return;
  }
  if (isStationsListRequest(request, url)) {
    event.respondWith(handleStationsList(request));
    return;
  }
  if (isMapTile(url)) {
    event.respondWith(handleMapTile(request));
    return;
  }
  if (isStaticAsset(request, url)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }
  // Anything else (auth, profile, other API calls) is left untouched.
});

// Lets the page trigger an immediate activation of a waiting worker if we ever
// switch away from install-time skipWaiting.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING" || event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

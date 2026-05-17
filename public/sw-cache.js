/**
 * SchoolHub Pro — production PWA cache worker.
 *
 * Caches the dashboard video, logo and a few key static assets so the
 * app stays usable on slow / intermittent connections.
 *
 * - NetworkFirst for HTML navigations (never lock users to an old shell).
 * - CacheFirst for the dashboard video, poster and logo.
 * - Registered only from a non-preview, non-iframe production origin by
 *   src/pwa/registerPwa.ts.
 */
const VERSION = "v1";
const STATIC_CACHE = `sh-static-${VERSION}`;
const MEDIA_CACHE = `sh-media-${VERSION}`;

const PRECACHE_URLS = [
  "/logo-schoolhub-pro.png",
  "/dashboard-video-poster.jpg",
  "/manifest.json",
];

const MEDIA_URLS = [
  "/dashboard-video.mp4",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(PRECACHE_URLS).catch(() => {});
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((n) => ![STATIC_CACHE, MEDIA_CACHE].includes(n))
        .map((n) => caches.delete(n))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  // Kill-switch: page can ask the SW to clean up and unregister.
  if (event.data && event.data.type === "PWA_KILL") {
    event.waitUntil((async () => {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
      await self.registration.unregister();
    })());
  }
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // HTML navigations: NetworkFirst with short timeout.
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        return fresh;
      } catch {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(req);
        return cached || new Response("Hors ligne", { status: 503 });
      }
    })());
    return;
  }

  // Dashboard video: CacheFirst (large asset, rarely changes).
  if (MEDIA_URLS.some((p) => url.pathname === p)) {
    event.respondWith((async () => {
      const cache = await caches.open(MEDIA_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        if (fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return cached || new Response("", { status: 503 });
      }
    })());
    return;
  }

  // Static brand assets: CacheFirst.
  if (PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        if (fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return cached || new Response("", { status: 503 });
      }
    })());
  }
});
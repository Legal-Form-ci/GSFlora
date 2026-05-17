/**
 * SchoolHub Pro — kill-switch service worker.
 *
 * If any older service worker was previously registered on this origin,
 * this file replaces it and immediately unregisters itself, clearing
 * all caches so users never get stuck on a stale shell.
 *
 * NOTE: We intentionally do NOT cache anything here while running inside
 * Lovable's preview/iframe context. PWA caching of the dashboard video
 * and key assets is opt-in and activated only in production by
 * src/pwa/registerPwa.ts.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    try {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    } catch (_) {}
    try { await self.registration.unregister(); } catch (_) {}
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    await Promise.all(clients.map((c) => {
      try {
        const url = new URL(c.url);
        url.searchParams.set("sw-cleanup", Date.now().toString());
        return c.navigate(url.toString());
      } catch { return null; }
    }));
  })());
});
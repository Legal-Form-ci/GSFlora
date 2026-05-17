/**
 * Production-only PWA registration with a strict preview/iframe guard
 * and a kill-switch. Safe to import unconditionally — it no-ops in dev
 * and inside Lovable's preview iframe.
 */
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const host = typeof window !== "undefined" ? window.location.hostname : "";
const isPreviewHost =
  host.includes("id-preview--") ||
  host.includes("lovableproject.com") ||
  host.includes("lovable.dev") ||
  host === "localhost" ||
  host === "127.0.0.1";

const isProd = import.meta.env.PROD;

export function registerPwa(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  // Kill-switch: in dev, preview or iframe, unregister ALL workers and clear caches.
  if (!isProd || isPreviewHost || isInIframe) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister().catch(() => {}));
    }).catch(() => {});
    if ("caches" in window) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k).catch(() => {})));
    }
    return;
  }

  // Production: register the cache worker once the page is idle.
  const register = () => {
    navigator.serviceWorker
      .register("/sw-cache.js", { scope: "/" })
      .catch((err) => console.warn("[pwa] registration failed", err));
  };

  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}

/** Emergency: call to clear cache + unregister (kill-switch from UI). */
export async function killPwa(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    regs.map(async (r) => {
      r.active?.postMessage({ type: "PWA_KILL" });
      try { await r.unregister(); } catch {}
    })
  );
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k).catch(() => {})));
  }
}
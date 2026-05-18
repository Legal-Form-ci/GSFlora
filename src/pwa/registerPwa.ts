/**
 * Production-only PWA registration with a strict preview/iframe guard
 * and a kill-switch. Safe to import unconditionally — it no-ops in dev
 * and inside Lovable's preview iframe.
 */

export type PwaRegistrationEnv = {
  hostname: string;
  isIframe: boolean;
  isProd: boolean;
};

const PREVIEW_HOST_FRAGMENTS = ["id-preview--", "lovableproject.com", "lovable.dev"];
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", ""]);

/** Pure predicate, exported for E2E/unit tests. */
export function shouldRegisterPwa(env: PwaRegistrationEnv): boolean {
  if (env.isIframe) return false;
  if (!env.isProd) return false;
  if (LOCAL_HOSTS.has(env.hostname)) return false;
  if (PREVIEW_HOST_FRAGMENTS.some((f) => env.hostname.includes(f))) return false;
  return true;
}

function detectEnv(): PwaRegistrationEnv {
  let isIframe = true;
  try { isIframe = window.self !== window.top; } catch { isIframe = true; }
  return {
    hostname: typeof window !== "undefined" ? window.location.hostname : "",
    isIframe,
    isProd: !!import.meta.env.PROD,
  };
}

export function registerPwa(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  // Kill-switch: in dev, preview or iframe, unregister ALL workers and clear caches.
  if (!shouldRegisterPwa(detectEnv())) {
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
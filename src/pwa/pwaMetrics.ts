/**
 * Lightweight PWA / network telemetry.
 * - Computes how many bytes were served from the SW cache vs the network
 *   using the Performance Resource Timing API (transferSize === 0 when the
 *   response came from the cache or a service worker).
 * - Detects slow connections via navigator.connection (NetworkInformation).
 */

export type PwaMetrics = {
  totalResources: number;
  cachedResources: number;
  cachedBytes: number;
  networkBytes: number;
  ratio: number;
};

export function collectPwaMetrics(): PwaMetrics {
  if (typeof performance === "undefined" || !performance.getEntriesByType) {
    return { totalResources: 0, cachedResources: 0, cachedBytes: 0, networkBytes: 0, ratio: 0 };
  }
  const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  let cachedBytes = 0;
  let networkBytes = 0;
  let cachedCount = 0;
  for (const e of entries) {
    const decoded = e.decodedBodySize || 0;
    if (e.transferSize === 0 && decoded > 0) {
      cachedBytes += decoded;
      cachedCount += 1;
    } else {
      networkBytes += e.transferSize || 0;
    }
  }
  const total = cachedBytes + networkBytes || 1;
  return {
    totalResources: entries.length,
    cachedResources: cachedCount,
    cachedBytes,
    networkBytes,
    ratio: cachedBytes / total,
  };
}

export type ConnectionInfo = {
  effectiveType: string;
  downlinkMbps: number;
  rtt: number;
  saveData: boolean;
  isSlow: boolean;
};

export function readConnectionInfo(): ConnectionInfo {
  const c = (navigator as any)?.connection;
  const effectiveType: string = c?.effectiveType ?? "unknown";
  const downlinkMbps: number = Number(c?.downlink ?? 0);
  const rtt: number = Number(c?.rtt ?? 0);
  const saveData: boolean = !!c?.saveData;
  const isSlow =
    saveData ||
    /(^|-)2g$/.test(effectiveType) ||
    effectiveType === "slow-2g" ||
    (downlinkMbps > 0 && downlinkMbps < 1) ||
    rtt > 600;
  return { effectiveType, downlinkMbps, rtt, saveData, isSlow };
}

/** Formats bytes for the debug indicator. */
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} kB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/** True when the user has opted into PWA debugging. */
export function isPwaDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (new URL(window.location.href).searchParams.get("debug") === "pwa") return true;
    return localStorage.getItem("debug-pwa") === "1";
  } catch {
    return false;
  }
}
import { describe, it, expect } from "vitest";
import { shouldRegisterPwa } from "@/pwa/registerPwa";
import { collectPwaMetrics, readConnectionInfo, formatBytes, isPwaDebugEnabled } from "@/pwa/pwaMetrics";

describe("PWA mode predicate (preview vs production)", () => {
  it("does NOT register in dev", () => {
    expect(shouldRegisterPwa({ hostname: "schoolhub.pro", isIframe: false, isProd: false })).toBe(false);
  });
  it("does NOT register inside an iframe (preview)", () => {
    expect(shouldRegisterPwa({ hostname: "schoolhub.pro", isIframe: true, isProd: true })).toBe(false);
  });
  it("does NOT register on Lovable preview hosts", () => {
    expect(shouldRegisterPwa({ hostname: "id-preview--abc.lovable.app", isIframe: false, isProd: true })).toBe(false);
    expect(shouldRegisterPwa({ hostname: "x.lovableproject.com", isIframe: false, isProd: true })).toBe(false);
    expect(shouldRegisterPwa({ hostname: "x.lovable.dev", isIframe: false, isProd: true })).toBe(false);
  });
  it("does NOT register on localhost", () => {
    expect(shouldRegisterPwa({ hostname: "localhost", isIframe: false, isProd: true })).toBe(false);
    expect(shouldRegisterPwa({ hostname: "127.0.0.1", isIframe: false, isProd: true })).toBe(false);
  });
  it("DOES register on real production origin", () => {
    expect(shouldRegisterPwa({ hostname: "app.schoolhub.pro", isIframe: false, isProd: true })).toBe(true);
    expect(shouldRegisterPwa({ hostname: "flora-campus.lovable.app", isIframe: false, isProd: true })).toBe(true);
  });
});

describe("PWA metrics & connection telemetry", () => {
  it("formatBytes renders human-readable values", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toMatch(/kB$/);
    expect(formatBytes(2 * 1024 * 1024)).toMatch(/MB$/);
  });
  it("collectPwaMetrics returns a zeroed report when no entries", () => {
    const m = collectPwaMetrics();
    expect(m.cachedBytes).toBeGreaterThanOrEqual(0);
    expect(m.networkBytes).toBeGreaterThanOrEqual(0);
    expect(m.ratio).toBeGreaterThanOrEqual(0);
  });
  it("readConnectionInfo never throws and returns sane defaults", () => {
    const c = readConnectionInfo();
    expect(typeof c.effectiveType).toBe("string");
    expect(typeof c.isSlow).toBe("boolean");
  });
  it("isPwaDebugEnabled toggles via localStorage", () => {
    localStorage.removeItem("debug-pwa");
    expect(isPwaDebugEnabled()).toBe(false);
    localStorage.setItem("debug-pwa", "1");
    expect(isPwaDebugEnabled()).toBe(true);
    localStorage.removeItem("debug-pwa");
  });
});

describe("Offline behavior of the dashboard video (cache-first contract)", () => {
  it("the public sw-cache.js declares the dashboard video for CacheFirst", async () => {
    const fs = await import("node:fs/promises");
    const sw = await fs.readFile("public/sw-cache.js", "utf8");
    expect(sw).toMatch(/dashboard-video\.mp4/);
    expect(sw).toMatch(/CacheFirst|cache\.match/);
  });
});
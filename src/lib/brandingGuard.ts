/**
 * Runtime guard that detects any leftover reference to the old logo/branding
 * and prevents it from being rendered.
 *
 * - Replaces <img src="…logo-flora…"> with the new SchoolHub Pro asset.
 * - Rewrites text nodes containing "GS Flora" to "SchoolHub Pro".
 * Activated only in browser environments; safe no-op on SSR/tests without DOM.
 */
import schoolhubLogo from "@/assets/logo-schoolhub-pro.png";

const OLD_LOGO_RE = /logo-flora|gs[-_ ]?flora/i;
const OLD_NAME_RE = /GS\s+Flora/g;

/**
 * Pure helpers — usable from React components/props (not just the DOM
 * MutationObserver). Use these to neutralize legacy branding before
 * passing strings/urls into props.
 */
export function sanitizeBrandText(value: string | null | undefined): string {
  if (!value) return value ?? "";
  return value.replace(OLD_NAME_RE, "SchoolHub Pro");
}

export function sanitizeLogoSrc(src: string | null | undefined, fallback?: string): string {
  if (!src) return src ?? "";
  if (OLD_LOGO_RE.test(src)) return fallback ?? "/logo-schoolhub-pro.png";
  return src;
}

export function isLegacyBranding(value: string | null | undefined): boolean {
  if (!value) return false;
  return OLD_LOGO_RE.test(value) || /GS\s+Flora/.test(value);
}

let started = false;

const fixImage = (img: HTMLImageElement) => {
  const src = img.getAttribute("src") || "";
  if (OLD_LOGO_RE.test(src)) {
    img.setAttribute("src", schoolhubLogo);
    img.setAttribute("alt", "SchoolHub Pro");
    if (import.meta.env.DEV) {
      console.warn("[brandingGuard] replaced legacy logo:", src);
    }
  }
  // Also sanitize alt / title / aria-label attributes that may carry legacy name.
  for (const attr of ["alt", "title", "aria-label"] as const) {
    const v = img.getAttribute(attr);
    if (v && /GS\s+Flora/.test(v)) img.setAttribute(attr, sanitizeBrandText(v));
  }
};

const fixTextNode = (node: Text) => {
  if (node.nodeValue && OLD_NAME_RE.test(node.nodeValue)) {
    node.nodeValue = node.nodeValue.replace(OLD_NAME_RE, "SchoolHub Pro");
  }
};

const sweep = (root: Node) => {
  if (root.nodeType === Node.ELEMENT_NODE) {
    const el = root as Element;
    if (el.tagName === "IMG") fixImage(el as HTMLImageElement);
    el.querySelectorAll?.("img").forEach((img) => fixImage(img as HTMLImageElement));
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode())) fixTextNode(n as Text);
  } else if (root.nodeType === Node.TEXT_NODE) {
    fixTextNode(root as Text);
  }
};

export function startBrandingGuard(): void {
  if (typeof document === "undefined") return;

  const run = () => {
    if (document.body) sweep(document.body);
    if (started) return;
    started = true;
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach(sweep);
        if (m.type === "attributes" && m.target.nodeType === Node.ELEMENT_NODE) {
          const el = m.target as Element;
          if (el.tagName === "IMG") fixImage(el as HTMLImageElement);
        }
      }
    });
    obs.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "alt"],
      characterData: true,
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
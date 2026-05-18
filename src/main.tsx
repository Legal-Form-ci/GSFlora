import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerPwa } from "./pwa/registerPwa";
import { startBrandingGuard } from "./lib/brandingGuard";

createRoot(document.getElementById("root")!).render(<App />);

// Activates only in production builds on the live origin.
// In dev / preview / iframe it unregisters any SW + clears caches.
registerPwa();

// Runtime safety net: detects & rewrites any stray legacy branding.
startBrandingGuard();

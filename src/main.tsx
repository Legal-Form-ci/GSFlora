import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerPwa } from "./pwa/registerPwa";

createRoot(document.getElementById("root")!).render(<App />);

// Activates only in production builds on the live origin.
// In dev / preview / iframe it unregisters any SW + clears caches.
registerPwa();

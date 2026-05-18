import { useEffect, useState } from "react";
import { WifiOff, Wifi, Database } from "lucide-react";
import {
  collectPwaMetrics,
  readConnectionInfo,
  formatBytes,
  isPwaDebugEnabled,
  type PwaMetrics,
  type ConnectionInfo,
} from "@/pwa/pwaMetrics";

/**
 * Floating debug badge that surfaces PWA cache impact and slow-network state.
 * Only visible when ?debug=pwa or localStorage.debug-pwa=1.
 */
const ConnectionIndicator = () => {
  const [enabled] = useState<boolean>(() => isPwaDebugEnabled());
  const [conn, setConn] = useState<ConnectionInfo>(() => readConnectionInfo());
  const [metrics, setMetrics] = useState<PwaMetrics>(() => collectPwaMetrics());
  const [online, setOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    if (!enabled) return;
    const tick = () => { setConn(readConnectionInfo()); setMetrics(collectPwaMetrics()); };
    const id = window.setInterval(tick, 3000);
    const c = (navigator as any)?.connection;
    c?.addEventListener?.("change", tick);
    const onOn = () => setOnline(true);
    const onOff = () => setOnline(false);
    window.addEventListener("online", onOn);
    window.addEventListener("offline", onOff);
    return () => {
      window.clearInterval(id);
      c?.removeEventListener?.("change", tick);
      window.removeEventListener("online", onOn);
      window.removeEventListener("offline", onOff);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    // eslint-disable-next-line no-console
    console.info("[pwa-metrics]", { ...metrics, connection: conn });
  }, [enabled, metrics, conn]);

  if (!enabled) return null;

  const slow = conn.isSlow || !online;

  return (
    <div
      data-testid="pwa-debug-indicator"
      className="fixed bottom-3 right-3 z-[9999] rounded-xl border border-border bg-card/95 backdrop-blur px-3 py-2 shadow-lg text-xs font-mono text-foreground flex flex-col gap-1 max-w-[260px]"
    >
      <div className="flex items-center gap-2">
        {slow ? <WifiOff className="w-3.5 h-3.5 text-destructive" /> : <Wifi className="w-3.5 h-3.5 text-primary" />}
        <span className={slow ? "text-destructive font-semibold" : "text-foreground"}>
          {online ? `${conn.effectiveType}${conn.saveData ? " · saveData" : ""}` : "offline"}
        </span>
        <span className="text-muted-foreground ml-auto">{conn.downlinkMbps || "?"}↓ {conn.rtt || "?"}ms</span>
      </div>
      <div className="flex items-center gap-2">
        <Database className="w-3.5 h-3.5 text-secondary" />
        <span>{metrics.cachedResources}/{metrics.totalResources} from cache</span>
        <span className="text-muted-foreground ml-auto">
          {formatBytes(metrics.cachedBytes)} / {formatBytes(metrics.networkBytes)}
        </span>
      </div>
      {slow && (
        <p className="text-[10px] text-destructive">
          Mode dégradé actif — vidéo et animations restreintes.
        </p>
      )}
    </div>
  );
};

export default ConnectionIndicator;
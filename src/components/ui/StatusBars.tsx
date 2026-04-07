// src/components/ui/StatusBars.tsx
"use client";
import { useState, useEffect } from "react";
import { Icon }    from "./Icon";
import { Spinner } from "./Spinner";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    setOffline(!navigator.onLine);
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (!offline) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 998,
      background: "#FFEAA7", color: "#7c5c00",
      fontSize: 12, fontWeight: 600, padding: "8px 16px",
      display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
    }}>
      <Icon name="wifi_off" size={14} color="#7c5c00" /> Modo offline — dados em cache
    </div>
  );
}

export function SyncDot({ on }: { on: boolean }) {
  if (!on) return null;
  return (
    <div style={{
      position: "fixed", bottom: 90, left: 20, zIndex: 50,
      background: "#1e293b", borderRadius: 20, padding: "5px 12px",
      display: "flex", alignItems: "center", gap: 6,
      border: "1px solid #ffffff10", boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
    }}>
      <Spinner size={12} color="#4D96FF" />
      <span style={{ fontSize: 11, color: "#64748b" }}>Sincronizando...</span>
    </div>
  );
}

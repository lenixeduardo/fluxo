"use client";
// src/contexts/ToastContext.tsx

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error" | "info" | "warn";

interface Toast { id: number; msg: string; type: ToastType; }

const ToastCtx = createContext<((msg: string, type?: ToastType) => void) | null>(null);

const COLOR: Record<ToastType, string> = {
  success: "#6BCB77",
  error:   "#FF6B6B",
  info:    "#4D96FF",
  warn:    "#FFEAA7",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((msg: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((p) => [...p.slice(-2), { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div style={{
        position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)",
        zIndex: 999, display: "flex", flexDirection: "column", gap: 7,
        width: "calc(100% - 32px)", maxWidth: 390, pointerEvents: "none",
      }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            background: "#1e293b",
            border:     `1px solid ${COLOR[t.type]}40`,
            borderLeft: `3px solid ${COLOR[t.type]}`,
            borderRadius: 10, padding: "11px 16px",
            color: "#e2e8f0", fontSize: 13, fontWeight: 500,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            animation: "tin .2s ease",
          }}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
};

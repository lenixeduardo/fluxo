// src/components/ui/BottomNav.tsx
"use client";
import { Icon } from "./Icon";

type Screen = "home" | "txns" | "reports" | "profile";

interface BottomNavProps { active: Screen; onChange: (s: Screen) => void; }

const TABS: { key: Screen; icon: string; label: string }[] = [
  { key: "home",    icon: "home",  label: "Início"     },
  { key: "txns",    icon: "list",  label: "Transações" },
  { key: "reports", icon: "chart", label: "Relatórios" },
  { key: "profile", icon: "user",  label: "Perfil"     },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "rgba(10,15,30,0.96)", backdropFilter: "blur(20px)",
      borderTop: "1px solid #ffffff0d", display: "flex", zIndex: 60,
      paddingBottom: "env(safe-area-inset-bottom,0px)",
    }}>
      {TABS.map((t) => {
        const on = active === t.key;
        return (
          <button key={t.key} onClick={() => onChange(t.key)} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", padding: "10px 0 6px",
            border: "none", background: "transparent", cursor: "pointer", gap: 3,
          }}>
            <div style={{
              width: 34, height: 26, display: "flex",
              alignItems: "center", justifyContent: "center",
              borderRadius: 9,
              background: on ? "#4D96FF1a" : "transparent",
              transition: "background .2s",
            }}>
              <Icon name={t.icon} size={19} color={on ? "#4D96FF" : "#475569"} />
            </div>
            <span style={{
              fontSize: 10, letterSpacing: "0.02em",
              color:      on ? "#4D96FF" : "#475569",
              fontWeight: on ? 600 : 400,
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

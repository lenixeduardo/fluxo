"use client";
// src/components/features/ProfileScreen.tsx

import { useState }        from "react";
import { useAuth }         from "@/contexts/AuthContext";
import { useBudgets }      from "@/contexts/BudgetContext";
import { useToast }        from "@/contexts/ToastContext";
import { BudgetEditModal } from "@/components/modals/BudgetModals";
import { Icon }            from "@/components/ui/Icon";
import { Spinner }         from "@/components/ui/Spinner";
import { formatCurrencyShort, getInitials } from "@/lib/utils";
import { CATEGORIES }      from "@/lib/constants";
import type { Transaction } from "@/types";

interface Props { txns?: Transaction[]; revalidate: (force?: boolean) => void; }

export function ProfileScreen({ txns, revalidate }: Props) {
  const { user, token, logout, setUser } = useAuth();
  const { budgets } = useBudgets();
  const toast = useToast();

  const [editing, setEditing]         = useState(false);
  const [name,    setName]            = useState(user?.name ?? "");
  const [saving,  setSaving]          = useState(false);
  const [showBudgetEdit, setShowBudgetEdit] = useState(false);

  const txList = txns ?? [];
  const bal    = txList.reduce((s, t) => s + (t.type === "INCOME" ? t.amount : -t.amount), 0);
  const activeBudgetCount = budgets.filter((b) => b.amount > 0).length;

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar.");
      const updated = await res.json();
      setUser(updated);
      setEditing(false);
      toast("Perfil atualizado ✅", "success");
    } catch (e: any) { toast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const MENU = [
    { icon: "🔔", label: "Notificações",          sub: "Alertas de orçamento ativos"    },
    { icon: "📤", label: "Exportar dados",         sub: "CSV · PDF · Excel"              },
    { icon: "🛡️", label: "Privacidade & Segurança",sub: "Criptografia de ponta a ponta" },
    { icon: "🤖", label: "IA — Claude Sonnet",     sub: "Categorização automática ativa" },
    { icon: "📱", label: "PWA instalado",          sub: "Service Worker + offline cache" },
  ];

  return (
    <div style={{ padding: "0 20px 80px", overflowY: "auto", height: "100vh", boxSizing: "border-box" }}>
      {/* avatar + name */}
      <div style={{ paddingTop: 48, paddingBottom: 24, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#4D96FF,#6BCB77)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff" }}>{getInitials(user?.name)}</div>
        {editing ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #4D96FF", background: "#1e293b", color: "#e2e8f0", fontSize: 16, fontWeight: 600, textAlign: "center", outline: "none", width: 185 }} />
            <button onClick={save} disabled={saving} style={{ background: "#4D96FF", border: "none", borderRadius: 10, padding: "8px 13px", cursor: "pointer" }}>{saving ? <Spinner size={14} color="#fff" /> : <Icon name="check" size={14} color="#fff" />}</button>
            <button onClick={() => setEditing(false)} style={{ background: "#1e293b", border: "1px solid #ffffff10", borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}><Icon name="close" size={14} color="#94a3b8" /></button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 4 }}>
            <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 20, margin: 0 }}>{user?.name}</h2>
            <button onClick={() => { setName(user?.name ?? ""); setEditing(true); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Icon name="edit" size={14} color="#475569" /></button>
          </div>
        )}
        <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 8px" }}>{user?.email}</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: user?.plan === "PRO" ? "#6BCB7720" : "#4D96FF20", borderRadius: 20, padding: "4px 12px" }}>
          <span style={{ fontSize: 12, color: user?.plan === "PRO" ? "#6BCB77" : "#4D96FF", fontWeight: 600 }}>{user?.plan === "PRO" ? "✦ Pro" : "Free"}</span>
        </div>
      </div>

      {/* SWR card */}
      <div style={{ background: "#1e293b", borderRadius: 12, padding: "12px 16px", marginBottom: 16, border: "1px solid #4D96FF22", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#4D96FF15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="sync" size={17} color="#4D96FF" /></div>
        <div style={{ flex: 1 }}>
          <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, margin: "0 0 1px" }}>Cache SWR ativo</p>
          <p style={{ color: "#475569", fontSize: 11, margin: 0 }}>Mutations otimistas · Revalida em foco · TTL 30s</p>
        </div>
        <button onClick={() => { revalidate(true); toast("Cache invalidado", "info"); }} style={{ background: "#4D96FF22", border: "1px solid #4D96FF33", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#4D96FF", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
          Revalidar
        </button>
      </div>

      {/* stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[[`${txList.length}`, "Transações"], [formatCurrencyShort(Math.abs(bal)), "Saldo"], [String(CATEGORIES.length), "Categorias"]].map(([v, l]) => (
          <div key={l} style={{ flex: 1, background: "#1e293b", borderRadius: 12, padding: "12px 6px", textAlign: "center", border: "1px solid #ffffff08" }}>
            <p style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15, margin: "0 0 2px" }}>{v}</p>
            <p style={{ color: "#64748b", fontSize: 11, margin: 0 }}>{l}</p>
          </div>
        ))}
      </div>

      {/* menu */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {/* budgets row */}
        <div onClick={() => setShowBudgetEdit(true)} style={{ background: "#1e293b", borderRadius: 12, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", border: "1px solid #4D96FF22" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#4D96FF15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🎯</div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600, margin: "0 0 1px" }}>Orçamentos mensais</p>
            <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>{activeBudgetCount === 0 ? "Nenhum configurado — toque para definir" : `${activeBudgetCount} ${activeBudgetCount === 1 ? "categoria" : "categorias"} monitoradas`}</p>
          </div>
          <span style={{ color: "#4D96FF", fontSize: 18 }}>›</span>
        </div>
        {MENU.map((item, i) => (
          <div key={i} style={{ background: "#1e293b", borderRadius: 12, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", border: "1px solid #ffffff08" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 500, margin: "0 0 1px" }}>{item.label}</p>
              <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>{item.sub}</p>
            </div>
            <span style={{ color: "#334155", fontSize: 18 }}>›</span>
          </div>
        ))}
      </div>

      <button onClick={logout} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "1px solid #FF6B6B33", background: "#FF6B6B0d", color: "#FF6B6B", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="logout" size={17} color="#FF6B6B" /> Sair da conta
      </button>

      {showBudgetEdit && <BudgetEditModal onClose={() => setShowBudgetEdit(false)} />}
    </div>
  );
}

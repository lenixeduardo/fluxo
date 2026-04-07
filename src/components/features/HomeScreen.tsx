"use client";
// src/components/features/HomeScreen.tsx

import { useState, useMemo }    from "react";
import { useAuth }              from "@/contexts/AuthContext";
import { useBudgets }           from "@/contexts/BudgetContext";
import { Sparkline }            from "@/components/charts";
import { TransactionCard }      from "./TransactionCard";
import { AddTransactionModal }  from "@/components/modals/AddTransactionModal";
import { Skeleton }             from "@/components/ui/Skeleton";
import { Icon }                 from "@/components/ui/Icon";
import { formatCurrency, getInitials } from "@/lib/utils";
import { getCategoryById }      from "@/lib/constants";
import type { Transaction, CreateTransactionInput } from "@/types";

const SPARKLINE = [4200, 4350, 3900, 4800, 5100, 4600, 5750];

interface Props {
  txns?:    Transaction[];
  loading:  boolean;
  onAdd:    (data: CreateTransactionInput) => Promise<void>;
}

export function HomeScreen({ txns, loading, onAdd }: Props) {
  const { user }    = useAuth();
  const { budgets } = useBudgets();
  const [modal, setModal] = useState(false);
  const txList = txns ?? [];

  const inc = txList.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const exp = txList.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const bal = inc - exp;

  const now = new Date();
  const spentByCat = useMemo(() =>
    txList
      .filter((t) => { const d = new Date(t.date + "T00:00:00"); return t.type === "EXPENSE" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
      .reduce<Record<string, number>>((acc, t) => ({ ...acc, [t.categoryId]: (acc[t.categoryId] ?? 0) + t.amount }), {}),
    [txList.length]
  );

  const activeBudgets = budgets.filter((b) => b.amount > 0).slice(0, 3);

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* hero */}
      <div style={{ background: "linear-gradient(165deg,#140d2e 0%,#0f172a 65%)", padding: "50px 20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -70, right: -70, width: 230, height: 230, borderRadius: "50%", background: "#6BCB7710", filter: "blur(45px)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <div>
              <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Olá, {user?.name?.split(" ")[0]} 👋</p>
              <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600, margin: "4px 0 0" }}>{new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</h2>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#4D96FF,#6BCB77)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>{getInitials(user?.name)}</div>
          </div>
          <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 4px" }}>Saldo atual</p>
          {loading ? <div style={{ marginBottom: 10 }}><Skeleton w="52%" h={44} r={8} /></div>
            : <h1 style={{ color: "#fff", fontSize: 38, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-1.5px" }}>{formatCurrency(bal)}</h1>}
          <Sparkline data={SPARKLINE} color="#6BCB77" height={50} />
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            {[{ l: "Receitas", v: inc, c: "#6BCB77", i: "up" }, { l: "Despesas", v: exp, c: "#FF6B6B", i: "dn" }].map((s) => (
              <div key={s.l} style={{ flex: 1, background: "#ffffff08", borderRadius: 12, padding: "12px 14px", backdropFilter: "blur(8px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}><Icon name={s.i} size={13} color={s.c} /><span style={{ fontSize: 11, color: s.c }}>{s.l}</span></div>
                {loading ? <Skeleton w="75%" h={16} r={4} /> : <p style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15, margin: 0 }}>{formatCurrency(s.v)}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* budgets */}
      <div style={{ padding: "20px 20px 0" }}>
        <p style={{ color: "#64748b", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 12px" }}>Orçamentos</p>
        {activeBudgets.length === 0 ? (
          <div style={{ background: "#1e293b", borderRadius: 12, padding: "18px 16px", border: "1px solid #ffffff08", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
            <p style={{ color: "#475569", fontSize: 13, margin: "0 0 4px" }}>Nenhum orçamento configurado.</p>
            <p style={{ color: "#334155", fontSize: 12, margin: 0 }}>Configure em <strong style={{ color: "#4D96FF" }}>Perfil → Orçamentos</strong></p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activeBudgets.map((b) => {
              const c = getCategoryById(b.categoryId);
              const spent = spentByCat[b.categoryId] ?? 0;
              const pct   = Math.min(spent / b.amount, 1);
              const bc    = pct >= 1 ? "#FF6B6B" : pct >= 0.8 ? "#FFEAA7" : "#6BCB77";
              return (
                <div key={b.categoryId} style={{ background: "#1e293b", borderRadius: 12, padding: "12px 14px", border: "1px solid #ffffff08" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 16 }}>{c.icon}</span><span style={{ fontSize: 14, color: "#e2e8f0" }}>{c.name}</span></div>
                    <span style={{ fontSize: 12, color: bc, fontWeight: 600 }}>{formatCurrency(spent)} / {formatCurrency(b.amount)}</span>
                  </div>
                  <div style={{ background: "#0f172a", borderRadius: 4, height: 5 }}><div style={{ width: `${pct * 100}%`, height: "100%", borderRadius: 4, background: bc, transition: "width .6s ease" }} /></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* recent */}
      <div style={{ padding: "20px 20px 0" }}>
        <p style={{ color: "#64748b", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 12px" }}>Recentes</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {loading ? [1, 2, 3].map((i) => (
            <div key={i} style={{ background: "#1e293b", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center", border: "1px solid #ffffff08" }}>
              <Skeleton w={44} h={44} r={12} /><div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}><Skeleton w="65%" h={13} r={5} /><Skeleton w="40%" h={11} r={4} /></div><Skeleton w={64} h={14} r={4} />
            </div>
          )) : txList.slice(0, 5).map((tx) => <TransactionCard key={tx.id} tx={tx} onDelete={async () => {}} />)}
        </div>
      </div>

      {modal && <AddTransactionModal onClose={() => setModal(false)} onAdd={onAdd} />}
      <button onClick={() => setModal(true)} style={{ position: "fixed", bottom: 90, right: 20, width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#4D96FF,#6BCB77)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px rgba(77,150,255,0.45)", zIndex: 50 }}>
        <Icon name="plus" size={24} color="#fff" />
      </button>
    </div>
  );
}

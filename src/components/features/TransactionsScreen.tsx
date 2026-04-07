"use client";
// src/components/features/TransactionsScreen.tsx

import { useState, useMemo }   from "react";
import { useVirtual }          from "@/hooks/useVirtual";
import { TransactionCard }     from "./TransactionCard";
import { AddTransactionModal } from "@/components/modals/AddTransactionModal";
import { Skeleton }            from "@/components/ui/Skeleton";
import { Icon }                from "@/components/ui/Icon";
import { formatCurrency }      from "@/lib/utils";
import type { Transaction, CreateTransactionInput } from "@/types";

interface Props {
  txns?:    Transaction[];
  loading:  boolean;
  onDelete: (id: string) => Promise<void>;
  onAdd:    (data: CreateTransactionInput) => Promise<void>;
}

type Filter = "ALL" | "INCOME" | "EXPENSE";

const TABS: { v: Filter; label: string; icon: string; color: string }[] = [
  { v: "ALL",     label: "Todos",    icon: "list", color: "#4D96FF" },
  { v: "INCOME",  label: "Receitas", icon: "up",   color: "#6BCB77" },
  { v: "EXPENSE", label: "Despesas", icon: "dn",   color: "#FF6B6B" },
];

export function TransactionsScreen({ txns, loading, onDelete, onAdd }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [modal,  setModal]  = useState(false);
  const txList = txns ?? [];

  const inc = txList.filter((t) => t.type === "INCOME").reduce((s, t)  => s + t.amount, 0);
  const exp = txList.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const bal = inc - exp;

  const filtered = useMemo(() =>
    txList.filter((t) => {
      if (filter === "INCOME"  && t.type !== "INCOME")  return false;
      if (filter === "EXPENSE" && t.type !== "EXPENSE") return false;
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }), [txList, search, filter]);

  // Flatten to [header, tx, tx, header, tx…] for virtualizer
  const rows = useMemo(() => {
    const byDate: Record<string, Transaction[]> = {};
    filtered.forEach((tx) => {
      const d = new Date(tx.date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
      if (!byDate[d]) byDate[d] = [];
      byDate[d].push(tx);
    });
    const flat: ({ type: "hdr"; d: string; txs: Transaction[] } | { type: "tx"; tx: Transaction })[] = [];
    Object.entries(byDate).forEach(([d, txs]) => {
      flat.push({ type: "hdr", d, txs });
      txs.forEach((tx) => flat.push({ type: "tx", tx }));
    });
    return flat;
  }, [filtered]);

  const { containerRef, virtualItems, totalHeight, measureRef } = useVirtual({ count: rows.length, estimateSize: () => 72, overscan: 8 });

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0a0f1e" }}>
      {/* header */}
      <div style={{ background: "linear-gradient(160deg,#140d2e 0%,#0f172a 70%)", padding: "44px 20px 0", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "#4D96FF0e", filter: "blur(40px)", pointerEvents: "none" }} />
        {/* title + add */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, position: "relative" }}>
          <div>
            <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 24, margin: 0, letterSpacing: "-0.5px" }}>Transações</h2>
            <p style={{ color: "#475569", fontSize: 12, margin: "3px 0 0" }}>{new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
          </div>
          <button onClick={() => setModal(true)} style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#4D96FF,#6BCB77)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 14px rgba(77,150,255,0.4)", flexShrink: 0 }}>
            <Icon name="plus" size={20} color="#fff" />
          </button>
        </div>
        {/* mini summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16, position: "relative" }}>
          {[{ label: "Receitas", value: inc, color: "#6BCB77", sign: "+" }, { label: "Despesas", value: exp, color: "#FF6B6B", sign: "-" }, { label: "Saldo", value: bal, color: bal >= 0 ? "#4D96FF" : "#FF6B6B", sign: "" }].map((s) => (
            <div key={s.label} style={{ background: "#ffffff09", borderRadius: 10, padding: "10px 10px 9px", border: "1px solid #ffffff0b" }}>
              <p style={{ color: "#64748b", fontSize: 10, fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase" }}>{s.label}</p>
              {loading ? <Skeleton w="80%" h={14} r={3} /> : <p style={{ color: s.color, fontWeight: 700, fontSize: 13, margin: 0 }}>{s.value >= 1000 ? `R$${(s.value / 1000).toFixed(1)}k` : formatCurrency(s.value)}</p>}
            </div>
          ))}
        </div>
        {/* search */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><Icon name="search" size={15} color="#475569" /></div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por descrição..."
            style={{ width: "100%", padding: "11px 40px 11px 36px", background: "#1e293b", border: "1px solid #ffffff10", borderRadius: 10, color: "#e2e8f0", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
          {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "#334155", border: "none", borderRadius: 6, width: 22, height: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="close" size={12} color="#94a3b8" /></button>}
        </div>
        {/* filter tabs */}
        <div style={{ display: "flex", gap: 0, background: "#0f172a", borderRadius: "10px 10px 0 0", padding: "4px 4px 0", borderTop: "1px solid #ffffff0a", borderLeft: "1px solid #ffffff0a", borderRight: "1px solid #ffffff0a" }}>
          {TABS.map((t) => {
            const on = filter === t.v;
            return (
              <button key={t.v} onClick={() => setFilter(t.v)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 6px", borderRadius: "8px 8px 0 0", border: "none", cursor: "pointer", background: on ? "#1e293b" : "transparent", color: on ? t.color : "#475569", fontSize: 13, fontWeight: on ? 700 : 400, borderBottom: on ? `2px solid ${t.color}` : "2px solid transparent" }}>
                <Icon name={t.icon} size={13} color={on ? t.color : "#475569"} />
                {t.label}
                {on && filtered.length > 0 && <span style={{ background: `${t.color}22`, color: t.color, fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 6px" }}>{filtered.length}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* virtual list */}
      <div style={{ flex: 1, overflow: "hidden", background: "#0f172a", padding: "0 16px" }}>
        {loading ? (
          <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ background: "#1e293b", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center", border: "1px solid #ffffff08" }}>
                <Skeleton w={44} h={44} r={12} /><div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}><Skeleton w="62%" h={13} r={5} /><Skeleton w="38%" h={11} r={4} /></div><Skeleton w={58} h={14} r={4} />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#334155", paddingBottom: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.6 }}>{search ? "🔍" : "📭"}</div>
            <p style={{ color: "#475569", fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>{search ? "Nenhum resultado" : "Sem transações"}</p>
            <p style={{ color: "#334155", fontSize: 13, margin: 0, textAlign: "center" }}>{search ? `Nada encontrado para "${search}"` : "Toque em + para adicionar a primeira"}</p>
          </div>
        ) : (
          <div ref={containerRef} style={{ height: "100%", overflowY: "auto", paddingTop: 4, paddingBottom: 90 }}>
            <div style={{ height: totalHeight, position: "relative" }}>
              {virtualItems.map(({ index, start }) => {
                const row = rows[index];
                if (row.type === "hdr") {
                  const dayNet = row.txs.reduce((s, t) => s + (t.type === "INCOME" ? t.amount : -t.amount), 0);
                  return (
                    <div key={`h${index}`} ref={measureRef(index)} style={{ position: "absolute", top: start, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 4px 6px" }}>
                      <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "capitalize", letterSpacing: "0.04em" }}>{row.d}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: dayNet >= 0 ? "#6BCB77" : "#FF6B6B", background: dayNet >= 0 ? "#6BCB7715" : "#FF6B6B15", borderRadius: 6, padding: "2px 8px" }}>{dayNet >= 0 ? "+" : ""}{formatCurrency(dayNet)}</span>
                    </div>
                  );
                }
                return (
                  <div key={row.tx.id} style={{ position: "absolute", top: start, left: 0, right: 0, paddingBottom: 6 }}>
                    <TransactionCard tx={row.tx} onDelete={onDelete} innerRef={measureRef(index)} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {modal && <AddTransactionModal onClose={() => setModal(false)} onAdd={onAdd} />}
    </div>
  );
}

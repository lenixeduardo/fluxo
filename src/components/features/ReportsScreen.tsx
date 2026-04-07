"use client";
// src/components/features/ReportsScreen.tsx

import { PieChart, BarChart } from "@/components/charts";
import { formatCurrency }     from "@/lib/utils";
import { CATEGORIES }         from "@/lib/constants";
import type { Transaction }   from "@/types";

interface Props { txns?: Transaction[]; }

const MONTH_INCOME  = [4200, 5100, 4800, 5600, 5300, 7300];
const MONTH_EXPENSE = [3100, 4200, 3700, 4100, 3900, 4450];
const MONTH_LABELS  = ["Nov", "Dez", "Jan", "Fev", "Mar", "Abr"];

export function ReportsScreen({ txns }: Props) {
  const txList = txns ?? [];
  const exp  = txList.filter((t) => t.type === "EXPENSE");
  const inc  = txList.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const tot  = exp.reduce((s, t) => s + t.amount, 0);
  const sav  = inc - tot;
  const savR = inc > 0 ? Math.round((sav / inc) * 100) : 0;

  const byCat = CATEGORIES
    .filter((c) => c.type === "EXPENSE")
    .map((c) => ({ label: c.name, color: c.color, value: exp.filter((t) => t.categoryId === c.id).reduce((s, t) => s + t.amount, 0) }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div style={{ padding: "0 20px 80px", overflowY: "auto", height: "100vh", boxSizing: "border-box" }}>
      <div style={{ paddingTop: 48, paddingBottom: 16 }}>
        <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 22, margin: 0 }}>Relatórios</h2>
        <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>{new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[{ l: "Receitas", v: formatCurrency(inc), c: "#6BCB77" }, { l: "Despesas", v: formatCurrency(tot), c: "#FF6B6B" }, { l: "Economizado", v: formatCurrency(sav), c: "#4D96FF" }, { l: "Taxa poupança", v: `${savR}%`, c: "#FFEAA7" }].map((s, i) => (
          <div key={i} style={{ background: "#1e293b", borderRadius: 14, padding: 14, border: "1px solid #ffffff08" }}>
            <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 6px" }}>{s.l}</p>
            <p style={{ color: s.c, fontWeight: 700, fontSize: 16, margin: 0 }}>{s.v}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#1e293b", borderRadius: 16, padding: 18, marginBottom: 14, border: "1px solid #ffffff08" }}>
        <p style={{ color: "#64748b", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 16px" }}>Gastos por Categoria</p>
        {byCat.length > 0 ? <PieChart data={byCat.slice(0, 6)} /> : <p style={{ color: "#475569", textAlign: "center", margin: 0 }}>Sem dados</p>}
      </div>

      <div style={{ background: "#1e293b", borderRadius: 16, padding: 18, border: "1px solid #ffffff08" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ color: "#64748b", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>Evolução Mensal</p>
          <div style={{ display: "flex", gap: 10 }}>
            {[["#6BCB77", "Receitas"], ["#FF6B6B", "Despesas"]].map(([c, l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: c }} /><span style={{ fontSize: 10, color: "#64748b" }}>{l}</span></div>
            ))}
          </div>
        </div>
        <BarChart income={MONTH_INCOME} expense={MONTH_EXPENSE} labels={MONTH_LABELS} />
      </div>
    </div>
  );
}

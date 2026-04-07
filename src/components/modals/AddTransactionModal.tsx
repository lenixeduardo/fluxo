// src/components/modals/AddTransactionModal.tsx
"use client";
import { useState }             from "react";
import { Icon }                 from "@/components/ui/Icon";
import { Spinner }              from "@/components/ui/Spinner";
import { useAISuggestion }      from "@/hooks/useAISuggestion";
import { useToast }             from "@/contexts/ToastContext";
import { CATEGORIES, getCategoryById } from "@/lib/constants";
import { formatCurrency, todayISO }    from "@/lib/utils";
import type { CreateTransactionInput } from "@/types";

interface Props { onClose: () => void; onAdd: (data: CreateTransactionInput) => Promise<void>; }

export function AddTransactionModal({ onClose, onAdd }: Props) {
  const [step,   setStep]   = useState(0);
  const [type,   setType]   = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [catId,  setCatId]  = useState<string | null>(null);
  const [desc,   setDesc]   = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const num      = parseFloat(amount.replace(",", ".")) || 0;
  const filtCats = CATEGORIES.filter((c) => c.type === type || c.type === "BOTH");
  const { suggestion, aiLoading } = useAISuggestion(desc, type, CATEGORIES);
  const sugCat = suggestion?.id ? getCategoryById(suggestion.id) : null;

  const numPad = (v: string) => {
    if (v === "⌫") { setAmount((a) => a.slice(0, -1)); return; }
    if (v === "," && amount.includes(",")) return;
    if (v === "," && !amount) { setAmount("0,"); return; }
    setAmount((a) => a + v);
  };

  const confirm = async () => {
    if (!num || !catId) return;
    setSaving(true);
    try {
      await onAdd({ amount: num, description: desc || getCategoryById(catId).name, type, date: todayISO(), categoryId: catId });
      toast(type === "INCOME" ? "Receita adicionada 💚" : "Despesa registrada 📝", "success");
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", display: "flex", alignItems: "flex-end", zIndex: 100, backdropFilter: "blur(8px)" }}>
      <div style={{ width: "100%", background: "#0f172a", borderRadius: "20px 20px 0 0", padding: 24, paddingBottom: 44, border: "1px solid #ffffff10", animation: "sup .28s ease", maxHeight: "90vh", overflowY: "auto" }}>

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {step > 0 && <button onClick={() => setStep((s) => s - 1)} style={{ background: "#1e293b", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: "#94a3b8", fontSize: 20, lineHeight: 1 }}>‹</button>}
            <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 18, margin: 0 }}>{["Valor", "Categoria", "Confirmar"][step]}</h3>
          </div>
          <button onClick={onClose} style={{ background: "#1e293b", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}>
            <Icon name="close" size={17} color="#94a3b8" />
          </button>
        </div>

        {/* step 0 — amount */}
        {step === 0 && <>
          <div style={{ display: "flex", background: "#1e293b", borderRadius: 10, padding: 4, marginBottom: 20 }}>
            {(["EXPENSE", "INCOME"] as const).map((v) => (
              <button key={v} onClick={() => setType(v)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer", background: type === v ? (v === "INCOME" ? "#6BCB77" : "#FF6B6B") : "transparent", color: type === v ? "#fff" : "#64748b", fontWeight: 600, fontSize: 14 }}>
                {v === "EXPENSE" ? "💸 Despesa" : "💰 Receita"}
              </button>
            ))}
          </div>
          <div style={{ textAlign: "center", padding: "10px 0 16px", fontSize: 38, fontWeight: 800, letterSpacing: "-1px", color: type === "INCOME" ? "#6BCB77" : "#FF6B6B" }}>
            {amount ? `R$ ${amount}` : "R$ 0"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
            {["1","2","3","4","5","6","7","8","9",",","0","⌫"].map((k) => (
              <button key={k} onClick={() => numPad(k)} style={{ padding: "13px 0", borderRadius: 12, border: "1px solid #ffffff08", background: "#1e293b", color: k === "⌫" ? "#FF6B6B" : "#e2e8f0", fontSize: 20, fontWeight: 500, cursor: "pointer" }}>{k}</button>
            ))}
          </div>
          <button onClick={() => num > 0 && setStep(1)} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: num > 0 ? (type === "INCOME" ? "#6BCB77" : "#FF6B6B") : "#1e293b", color: num > 0 ? "#fff" : "#475569", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            Continuar →
          </button>
        </>}

        {/* step 1 — categories */}
        {step === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {filtCats.map((c) => (
              <button key={c.id} onClick={() => { setCatId(c.id); setStep(2); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "11px 6px", borderRadius: 12, cursor: "pointer", background: catId === c.id ? `${c.color}22` : "#1e293b", border: `1px solid ${catId === c.id ? c.color : "#ffffff08"}` }}>
                <span style={{ fontSize: 22 }}>{c.icon}</span>
                <span style={{ fontSize: 10, color: "#cbd5e1", textAlign: "center", lineHeight: 1.3 }}>{c.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* step 2 — description + AI + confirm */}
        {step === 2 && <>
          <div style={{ marginBottom: 12 }}>
            <div style={{ position: "relative" }}>
              <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição (ex: iFood, Uber, Netflix...)" autoFocus
                style={{ width: "100%", padding: "12px 44px 12px 16px", borderRadius: 12, border: "1px solid #ffffff15", background: "#1e293b", color: "#e2e8f0", fontSize: 15, boxSizing: "border-box", outline: "none" }} />
              <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
                {aiLoading ? <Spinner size={16} color="#4D96FF" /> : <Icon name="ai" size={16} color="#334155" />}
              </div>
            </div>

            {sugCat && !aiLoading && (suggestion?.confidence ?? 0) > 0.4 && (
              <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 10, background: `${sugCat.color}14`, border: `1px solid ${sugCat.color}33`, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${sugCat.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{sugCat.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "#4D96FF", marginBottom: 1 }}>🤖 IA sugere</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{sugCat.name}</div>
                </div>
                <span style={{ fontSize: 11, color: sugCat.color, fontWeight: 700 }}>{Math.round((suggestion!.confidence) * 100)}%</span>
                <button onClick={() => setCatId(sugCat.id)} style={{ background: sugCat.color, border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#fff", fontSize: 11, fontWeight: 700 }}>Usar</button>
              </div>
            )}

            {catId && (
              <div style={{ marginTop: 8, padding: "9px 12px", borderRadius: 10, background: "#1e293b", border: "1px solid #ffffff10", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{getCategoryById(catId).icon}</span>
                  <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{getCategoryById(catId).name}</span>
                </div>
                <button onClick={() => setStep(1)} style={{ background: "none", border: "1px solid #ffffff10", borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: "#64748b", fontSize: 11 }}>trocar</button>
              </div>
            )}
          </div>

          <div style={{ background: "#1e293b", borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 3 }}>Valor total</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: type === "INCOME" ? "#6BCB77" : "#FF6B6B", letterSpacing: "-0.5px" }}>{type === "INCOME" ? "+ " : "- "}{formatCurrency(num)}</div>
            </div>
            <div style={{ fontSize: 32 }}>{type === "INCOME" ? "💰" : "💸"}</div>
          </div>

          <button onClick={confirm} disabled={saving || !catId} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: !catId || saving ? "#1e3a5f" : type === "INCOME" ? "#6BCB77" : "#FF6B6B", color: "#fff", fontSize: 16, fontWeight: 700, cursor: saving || !catId ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: !catId ? 0.5 : 1 }}>
            {saving ? <><Spinner size={18} color="#fff" />Salvando...</> : catId ? "✓ Confirmar" : "Selecione uma categoria →"}
          </button>
        </>}
      </div>
    </div>
  );
}

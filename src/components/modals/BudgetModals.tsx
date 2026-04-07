"use client";
// src/components/modals/BudgetModals.tsx

import { useState }        from "react";
import { useBudgets }      from "@/contexts/BudgetContext";
import { useToast }        from "@/contexts/ToastContext";
import { Icon }            from "@/components/ui/Icon";
import { Spinner }         from "@/components/ui/Spinner";
import { formatCurrency }  from "@/lib/utils";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import type { SaveBudgetInput } from "@/types";

// ── Setup Wizard ──────────────────────────────────────────────────────────────
function BudgetSetupModal({ onDone }: { onDone: () => void }) {
  const { saveBudgets } = useBudgets();
  const toast = useToast();
  const [step,   setStep]   = useState<0 | 1>(0);
  const [values, setValues] = useState<Record<string, string>>(
    () => Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.id, ""]))
  );
  const [saving, setSaving] = useState(false);

  const anyFilled = EXPENSE_CATEGORIES.some((c) => parseFloat(values[c.id]) > 0);

  const handleSave = async (skipEmpty = false) => {
    setSaving(true);
    try {
      const items: SaveBudgetInput[] = EXPENSE_CATEGORIES
        .map((c) => ({ categoryId: c.id, amount: parseFloat(values[c.id]) || 0 }))
        .filter((b) => skipEmpty ? true : b.amount > 0);
      await saveBudgets(items);
      toast("Orçamentos configurados! 🎯", "success");
      onDone();
    } catch (e: any) { toast(e.message, "error"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "flex-end", zIndex: 200, backdropFilter: "blur(10px)" }}>
      <div style={{ width: "100%", background: "#0f172a", borderRadius: "22px 22px 0 0", padding: 24, paddingBottom: 44, border: "1px solid #ffffff10", animation: "sup .3s ease", maxHeight: "90vh", overflowY: "auto" }}>

        {step === 0 && (
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 22, margin: "0 0 10px", letterSpacing: "-0.5px" }}>Configure seus orçamentos</h2>
            <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 28px", lineHeight: 1.6 }}>
              Defina quanto quer gastar em cada categoria por mês. Você pode alterar no Perfil a qualquer momento.
            </p>
            <button onClick={() => setStep(1)} style={{ width: "100%", padding: "15px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#4D96FF,#6BCB77)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(77,150,255,0.3)", marginBottom: 10 }}>
              Configurar agora →
            </button>
            <button onClick={() => handleSave(true)} style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "transparent", border: "1px solid #ffffff0d", color: "#475569", fontSize: 13, cursor: "pointer" }}>
              Pular por enquanto
            </button>
          </div>
        )}

        {step === 1 && <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <button onClick={() => setStep(0)} style={{ background: "#1e293b", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: "#94a3b8", fontSize: 20, lineHeight: 1 }}>‹</button>
            <div>
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 18, margin: 0 }}>Limite mensal por categoria</h3>
              <p style={{ color: "#64748b", fontSize: 12, margin: "2px 0 0" }}>Deixe em branco para não monitorar</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {EXPENSE_CATEGORIES.map((c) => (
              <div key={c.id} style={{ background: "#1e293b", borderRadius: 12, padding: "12px 14px", border: "1px solid #ffffff08", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}18`, border: `1px solid ${c.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{c.icon}</div>
                <span style={{ flex: 1, color: "#e2e8f0", fontSize: 14, fontWeight: 500 }}>{c.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#475569", fontSize: 13 }}>R$</span>
                  <input type="number" inputMode="numeric" placeholder="0" value={values[c.id]}
                    onChange={(e) => setValues((v) => ({ ...v, [c.id]: e.target.value }))}
                    style={{ width: 90, padding: "8px 10px", borderRadius: 8, border: `1px solid ${parseFloat(values[c.id]) > 0 ? c.color + "50" : "#ffffff15"}`, background: "#0f172a", color: "#e2e8f0", fontSize: 15, fontWeight: 600, textAlign: "right", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => handleSave(false)} disabled={saving || !anyFilled} style={{ width: "100%", padding: "15px 0", borderRadius: 12, border: "none", background: saving || !anyFilled ? "#1e3a5f" : "linear-gradient(135deg,#4D96FF,#6BCB77)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: saving || !anyFilled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: !anyFilled ? 0.5 : 1, marginBottom: 10, boxShadow: saving || !anyFilled ? "none" : "0 4px 20px rgba(77,150,255,0.3)" }}>
            {saving ? <><Spinner size={18} color="#fff" />Salvando...</> : "✓ Salvar orçamentos"}
          </button>
          <button onClick={() => handleSave(true)} style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "transparent", border: "1px solid #ffffff0d", color: "#475569", fontSize: 13, cursor: "pointer" }}>Pular por enquanto</button>
        </>}
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
export function BudgetEditModal({ onClose }: { onClose: () => void }) {
  const { budgets, saveBudgets } = useBudgets();
  const toast = useToast();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init = Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.id, ""]));
    budgets.forEach((b) => { init[b.categoryId] = String(b.amount); });
    return init;
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveBudgets(EXPENSE_CATEGORIES.map((c) => ({ categoryId: c.id, amount: parseFloat(values[c.id]) || 0 })));
      toast("Orçamentos atualizados! ✅", "success");
      onClose();
    } catch (e: any) { toast(e.message, "error"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", zIndex: 200, backdropFilter: "blur(8px)" }}>
      <div style={{ width: "100%", background: "#0f172a", borderRadius: "22px 22px 0 0", padding: 24, paddingBottom: 44, border: "1px solid #ffffff10", animation: "sup .28s ease", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 18, margin: 0 }}>Editar Orçamentos</h3>
            <p style={{ color: "#64748b", fontSize: 12, margin: "3px 0 0" }}>Limite mensal por categoria</p>
          </div>
          <button onClick={onClose} style={{ background: "#1e293b", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}><Icon name="close" size={17} color="#94a3b8" /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {EXPENSE_CATEGORIES.map((c) => {
            const val = parseFloat(values[c.id]) || 0;
            return (
              <div key={c.id} style={{ background: "#1e293b", borderRadius: 12, padding: "12px 14px", border: "1px solid #ffffff08", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}18`, border: `1px solid ${c.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{c.icon}</div>
                <div style={{ flex: 1 }}>
                  <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 500 }}>{c.name}</span>
                  {val > 0 && <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>Limite: {formatCurrency(val)}/mês</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#475569", fontSize: 13 }}>R$</span>
                  <input type="number" inputMode="numeric" placeholder="0" value={values[c.id]}
                    onChange={(e) => setValues((v) => ({ ...v, [c.id]: e.target.value }))}
                    style={{ width: 90, padding: "8px 10px", borderRadius: 8, border: `1px solid ${val > 0 ? c.color + "50" : "#ffffff15"}`, background: "#0f172a", color: "#e2e8f0", fontSize: 15, fontWeight: 600, textAlign: "right", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ color: "#334155", fontSize: 11, margin: "0 0 14px", textAlign: "center" }}>Defina como 0 para remover o orçamento de uma categoria</p>

        <button onClick={handleSave} disabled={saving} style={{ width: "100%", padding: "15px 0", borderRadius: 12, border: "none", background: saving ? "#1e3a5f" : "linear-gradient(135deg,#4D96FF,#6BCB77)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: saving ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: saving ? "none" : "0 4px 20px rgba(77,150,255,0.25)" }}>
          {saving ? <><Spinner size={18} color="#fff" />Salvando...</> : "✓ Salvar alterações"}
        </button>
      </div>
    </div>
  );
}

// ── Gate — shows wizard on first login ────────────────────────────────────────
export function BudgetSetupGate() {
  const { needsSetup, budgetLoad } = useBudgets();
  const [dismissed, setDismissed] = useState(false);
  if (budgetLoad || dismissed || !needsSetup) return null;
  return <BudgetSetupModal onDone={() => setDismissed(true)} />;
}

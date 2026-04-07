"use client";
// src/contexts/BudgetContext.tsx

import {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import type { Budget, SaveBudgetInput } from "@/types";

interface BudgetState {
  budgets:      Budget[];
  budgetLoad:   boolean;
  needsSetup:   boolean;
  saveBudgets:  (items: SaveBudgetInput[]) => Promise<void>;
}

const BudgetCtx = createContext<BudgetState | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [budgets,    setBudgets]    = useState<Budget[]>([]);
  const [budgetLoad, setBudgetLoad] = useState(true);

  useEffect(() => {
    if (!token) { setBudgets([]); setBudgetLoad(false); return; }
    setBudgetLoad(true);

    fetch("/api/budgets", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setBudgets)
      .catch(() => setBudgets([]))
      .finally(() => setBudgetLoad(false));
  }, [token]);

  const saveBudgets = useCallback(async (items: SaveBudgetInput[]) => {
    const res = await fetch("/api/budgets", {
      method:  "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify(items),
    });
    if (!res.ok) throw new Error("Falha ao salvar orçamentos.");
    const saved: Budget[] = await res.json();
    setBudgets(saved);
  }, [token]);

  const needsSetup = !budgetLoad && budgets.length === 0;

  return (
    <BudgetCtx.Provider value={{ budgets, budgetLoad, needsSetup, saveBudgets }}>
      {children}
    </BudgetCtx.Provider>
  );
}

export const useBudgets = (): BudgetState => {
  const ctx = useContext(BudgetCtx);
  if (!ctx) throw new Error("useBudgets must be inside BudgetProvider");
  return ctx;
};

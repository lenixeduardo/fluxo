"use client";
// src/components/features/Shell.tsx

import { useState } from "react";
import { useAuth }       from "@/contexts/AuthContext";
import { BudgetProvider } from "@/contexts/BudgetContext";
import { BottomNav }      from "@/components/ui/BottomNav";
import { OfflineBanner, SyncDot } from "@/components/ui/StatusBars";
import { Spinner }        from "@/components/ui/Spinner";
import { AuthScreen }     from "./AuthScreen";
import { HomeScreen }     from "./HomeScreen";
import { TransactionsScreen } from "./TransactionsScreen";
import { ReportsScreen }  from "./ReportsScreen";
import { ProfileScreen }  from "./ProfileScreen";
import { BudgetSetupGate } from "../modals/BudgetModals";
import { useSWR }         from "@/hooks/useSWR";
import { useToast }       from "@/contexts/ToastContext";
import type { Transaction, CreateTransactionInput } from "@/types";

type Screen = "home" | "txns" | "reports" | "profile";

// ── Loading splash ────────────────────────────────────────────────────────────
function LoadingSplash() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <div style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg,#4D96FF,#6BCB77)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 8px 32px rgba(77,150,255,0.3)" }}>💚</div>
      <Spinner size={26} color="#4D96FF" />
      <p style={{ color: "#334155", fontSize: 13, margin: 0 }}>Restaurando sessão...</p>
    </div>
  );
}

// ── Authenticated app shell ───────────────────────────────────────────────────
function MainApp() {
  const { token } = useAuth();
  const toast     = useToast();
  const [screen, setScreen] = useState<Screen>("home");

  const fetcher = () =>
    fetch("/api/transactions", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()) as Promise<Transaction[]>;

  const swrKey = token ? `transactions:${token.slice(-12)}` : null;
  const { data: txns, isLoading, mutate, revalidate } = useSWR<Transaction[]>(swrKey, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval:  5000,
  });

  // Optimistic CREATE
  const handleAdd = async (data: CreateTransactionInput) => {
    const optimistic = { id: `opt_${Date.now()}`, ...data, createdAt: new Date().toISOString() } as Transaction;
    await mutate(
      async () => {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Falha ao salvar transação.");
        return fetch("/api/transactions", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
      },
      { optimisticData: [optimistic, ...(txns ?? [])], rollbackOnError: true }
    );
  };

  // Optimistic DELETE
  const handleDelete = async (id: string) => {
    await mutate(
      async () => {
        const res = await fetch(`/api/transactions?id=${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Falha ao remover transação.");
        return fetch("/api/transactions", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
      },
      { optimisticData: (txns ?? []).filter((t) => t.id !== id), rollbackOnError: true }
    );
    toast("Transação removida.", "info");
  };

  return (
    <BudgetProvider>
      <BudgetSetupGate />
      <div style={{ minHeight: "100vh", background: "#0f172a", maxWidth: 430, margin: "0 auto", position: "relative" }}>
        <OfflineBanner />
        <SyncDot on={isLoading} />
        <div style={{ height: "100vh", overflowY: "auto" }}>
          {screen === "home"    && <HomeScreen    txns={txns} loading={isLoading} onAdd={handleAdd} />}
          {screen === "txns"    && <TransactionsScreen txns={txns} loading={isLoading} onDelete={handleDelete} onAdd={handleAdd} />}
          {screen === "reports" && <ReportsScreen txns={txns} />}
          {screen === "profile" && <ProfileScreen txns={txns} revalidate={revalidate} />}
        </div>
        <BottomNav active={screen} onChange={setScreen} />
      </div>
    </BudgetProvider>
  );
}

// ── Shell root ────────────────────────────────────────────────────────────────
export default function Shell() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSplash />;
  return user ? <MainApp /> : <AuthScreen />;
}

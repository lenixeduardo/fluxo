// src/components/features/TransactionCard.tsx
"use client";
import { useState }        from "react";
import { Icon }            from "@/components/ui/Icon";
import { Spinner }         from "@/components/ui/Spinner";
import { formatCurrency }  from "@/lib/utils";
import { getCategoryById } from "@/lib/constants";
import type { Transaction } from "@/types";

interface Props {
  tx:        Transaction;
  onDelete:  (id: string) => Promise<void>;
  innerRef?: (el: HTMLDivElement | null) => void;
}

export function TransactionCard({ tx, onDelete, innerRef }: Props) {
  const c        = getCategoryById(tx.categoryId);
  const isIncome = tx.type === "INCOME";
  const [revealed, setRevealed] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    await onDelete(tx.id);
  };

  return (
    <div
      ref={innerRef}
      onClick={() => setRevealed((r) => !r)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        background:   revealed ? "#160e2a" : "#1e293b",
        borderRadius: 12, padding: "12px 14px",
        border:       `1px solid ${revealed ? "#FF6B6B22" : "#ffffff08"}`,
        cursor: "pointer", transition: "background .18s, border .18s",
        opacity: deleting ? 0.4 : 1,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${c.color}18`, border: `1px solid ${c.color}28`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>
        {c.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
          {tx.description}
        </div>
        <div style={{ fontSize: 12, color: "#475569" }}>
          {c.name} · {new Date(tx.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
        </div>
      </div>

      {revealed ? (
        <button
          onClick={handleDelete} disabled={deleting}
          style={{ background: "#FF6B6B18", border: "1px solid #FF6B6B30", color: "#FF6B6B", borderRadius: 8, padding: "7px 10px", cursor: "pointer", flexShrink: 0 }}
        >
          {deleting ? <Spinner size={15} color="#FF6B6B" /> : <Icon name="trash" size={15} color="#FF6B6B" />}
        </button>
      ) : (
        <span style={{ fontSize: 15, fontWeight: 700, color: isIncome ? "#6BCB77" : "#FF6B6B", flexShrink: 0 }}>
          {isIncome ? "+ " : "- "}{formatCurrency(tx.amount)}
        </span>
      )}
    </div>
  );
}

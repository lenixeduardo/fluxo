// src/lib/constants.ts
import type { Category } from "@/types";

export const CATEGORIES: Category[] = [
  { id: "1",  name: "Alimentação", icon: "🍔", color: "#FF6B6B", type: "EXPENSE" },
  { id: "2",  name: "Transporte",  icon: "🚗", color: "#4ECDC4", type: "EXPENSE" },
  { id: "3",  name: "Moradia",     icon: "🏠", color: "#45B7D1", type: "EXPENSE" },
  { id: "4",  name: "Saúde",       icon: "💊", color: "#96CEB4", type: "EXPENSE" },
  { id: "5",  name: "Lazer",       icon: "🎮", color: "#FFEAA7", type: "EXPENSE" },
  { id: "6",  name: "Educação",    icon: "📚", color: "#DDA0DD", type: "EXPENSE" },
  { id: "7",  name: "Roupas",      icon: "👗", color: "#F0A500", type: "EXPENSE" },
  { id: "8",  name: "Salário",     icon: "💼", color: "#6BCB77", type: "INCOME"  },
  { id: "9",  name: "Freelance",   icon: "💻", color: "#4D96FF", type: "INCOME"  },
  { id: "10", name: "Investimento",icon: "📈", color: "#A8DADC", type: "INCOME"  },
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.type === "EXPENSE");
export const INCOME_CATEGORIES  = CATEGORIES.filter((c) => c.type === "INCOME");

export const getCategoryById = (id: string): Category =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

export const TOKEN_STORAGE_KEY = "fluxo_token_v1";

export const SWR_CONFIG = {
  revalidateOnFocus:  true,
  dedupingInterval:   5_000,
  staleTime:          30_000,
} as const;

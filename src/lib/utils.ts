// src/lib/utils.ts

/** Format a number as BRL currency */
export const formatCurrency = (n: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

/** Compact format: R$1,2k for values >= 1000 */
export const formatCurrencyShort = (n: number): string =>
  n >= 1000 ? `R$${(n / 1000).toFixed(1)}k` : `R$${n.toFixed(0)}`;

/** Today as YYYY-MM-DD in local timezone */
export const todayISO = (): string => new Date().toISOString().split("T")[0];

/** Extract initials from a full name */
export const getInitials = (name?: string | null): string =>
  name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "??";

/** Current month and year as { month: 1-12, year: YYYY } */
export const currentPeriod = (): { month: number; year: number } => {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
};

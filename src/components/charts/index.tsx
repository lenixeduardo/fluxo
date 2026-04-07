// src/components/charts/index.tsx
"use client";
import { formatCurrencyShort } from "@/lib/utils";

// ── Sparkline ─────────────────────────────────────────────────────────────────
export function Sparkline({ data, color = "#6BCB77", height = 50 }: { data: number[]; color?: string; height?: number }) {
  const min = Math.min(...data), max = Math.max(...data), w = 200, p = 4;
  const pts = data.map((v, i) =>
    `${p + (i / (data.length - 1)) * (w - p * 2)},${height - p - ((v - min) / (max - min || 1)) * (height - p * 2)}`
  );
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${pts[0]} L${pts.join(" L")} L${w - p},${height} L${p},${height} Z`} fill="url(#sg)" />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// ── Pie Chart ─────────────────────────────────────────────────────────────────
interface PieSlice { label: string; color: string; value: number; }

export function PieChart({ data }: { data: PieSlice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cur = 0;
  const slices = data.map((d) => {
    const pct = d.value / total, start = cur;
    cur += pct * 360;
    const r = 80, cx = 100, cy = 100;
    const sr = (start - 90) * Math.PI / 180, er = (cur - 90) * Math.PI / 180;
    return {
      ...d,
      path: `M${cx},${cy} L${cx + r * Math.cos(sr)},${cy + r * Math.sin(sr)} A${r},${r} 0 ${pct > 0.5 ? 1 : 0},1 ${cx + r * Math.cos(er)},${cy + r * Math.sin(er)} Z`,
      pct,
    };
  });
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <svg viewBox="0 0 200 200" style={{ width: 148, height: 148, flexShrink: 0 }}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="#0f172a" strokeWidth="1.5" />)}
        <circle cx="100" cy="100" r="50" fill="#0f172a" />
        <text x="100" y="97" textAnchor="middle" fill="#fff"     fontSize="11" fontWeight="700" fontFamily="system-ui">Total</text>
        <text x="100" y="112" textAnchor="middle" fill="#64748b" fontSize="9"  fontFamily="system-ui">{formatCurrencyShort(total)}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1, minWidth: 110 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 9, height: 9, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#cbd5e1", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</span>
            <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{(s.pct * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
interface BarChartProps { income: number[]; expense: number[]; labels: string[]; }

export function BarChart({ income, expense, labels }: BarChartProps) {
  const mx = Math.max(...income, ...expense);
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 112 }}>
      {labels.map((l, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: 90 }}>
            <div style={{ flex: 1, background: "#6BCB77", borderRadius: "3px 3px 0 0", height: `${(income[i] / mx) * 100}%`,  minHeight: 4, opacity: 0.85 }} />
            <div style={{ flex: 1, background: "#FF6B6B", borderRadius: "3px 3px 0 0", height: `${(expense[i] / mx) * 100}%`, minHeight: 4, opacity: 0.85 }} />
          </div>
          <span style={{ fontSize: 10, color: "#64748b" }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

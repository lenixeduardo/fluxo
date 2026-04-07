// src/components/ui/Spinner.tsx
"use client";

interface SpinnerProps { size?: number; color?: string; }

export function Spinner({ size = 20, color = "#4D96FF" }: SpinnerProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0110 10" stroke={color} strokeWidth="2.5" strokeLinecap="round">
        <animateTransform
          attributeName="transform" type="rotate"
          from="0 12 12" to="360 12 12"
          dur="0.75s" repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

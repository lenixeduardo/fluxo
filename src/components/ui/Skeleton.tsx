// src/components/ui/Skeleton.tsx
"use client";

interface SkeletonProps { w?: string | number; h?: number; r?: number; }

export function Skeleton({ w = "100%", h = 16, r = 6 }: SkeletonProps) {
  return (
    <div style={{
      width:        w,
      height:       h,
      borderRadius: r,
      background:   "#1e293b",
      animation:    "pulse 1.4s ease-in-out infinite",
    }} />
  );
}

// src/hooks/useVirtual.ts
// True windowing: renders only visible items + overscan.
// Measures real heights via ResizeObserver with proper cleanup.

import { useState, useEffect, useCallback, useMemo, useRef } from "react";

interface VirtualOptions {
  count:        number;
  estimateSize: () => number;
  overscan?:    number;
}

interface VirtualItem {
  index: number;
  start: number;
  size:  number;
}

export function useVirtual({ count, estimateSize, overscan = 5 }: VirtualOptions) {
  const ESTIMATED   = estimateSize();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop,  setScroll]  = useState(0);
  const [heights,    setHeights] = useState<Record<number, number>>({});

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const fn = () => setScroll(el.scrollTop);
    el.addEventListener("scroll", fn, { passive: true });
    return () => el.removeEventListener("scroll", fn);
  }, []);

  const getH = useCallback((i: number) => heights[i] ?? ESTIMATED, [heights, ESTIMATED]);

  const offsets = useMemo(() => {
    const a = new Array<number>(count + 1);
    a[0] = 0;
    for (let i = 0; i < count; i++) a[i + 1] = a[i] + getH(i);
    return a;
  }, [count, getH]);

  const totalHeight   = offsets[count] ?? 0;
  const viewH         = containerRef.current?.clientHeight ?? 600;

  // O(log n) binary search for first visible item
  let startIdx = 0;
  { let lo = 0, hi = count - 1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (offsets[m] <= scrollTop) { startIdx = m; lo = m + 1; } else hi = m - 1; } }

  let endIdx = startIdx;
  while (endIdx < count && offsets[endIdx] < scrollTop + viewH) endIdx++;

  const virtualItems: VirtualItem[] = [];
  const from = Math.max(0, startIdx - overscan);
  const to   = Math.min(count - 1, endIdx + overscan);
  for (let i = from; i <= to; i++) virtualItems.push({ index: i, start: offsets[i], size: getH(i) });

  // Stable callback-ref factory — ResizeObserver disconnects on unmount
  const roMap = useRef<Record<number, ResizeObserver>>({});
  const measureRef = useCallback(
    (i: number) => (el: HTMLDivElement | null) => {
      roMap.current[i]?.disconnect();
      if (!el) { delete roMap.current[i]; return; }
      const ro = new ResizeObserver(([entry]) => {
        const h = Math.round(entry.contentRect.height);
        setHeights((prev) => (prev[i] === h ? prev : { ...prev, [i]: h }));
      });
      ro.observe(el);
      roMap.current[i] = ro;
    },
    []
  );

  return { containerRef, virtualItems, totalHeight, measureRef };
}

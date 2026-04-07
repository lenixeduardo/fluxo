// src/hooks/useAISuggestion.ts
// Debounced hook that calls /api/ai/classify and returns category suggestion.

import { useState, useEffect, useRef } from "react";
import type { Category } from "@/types";

interface Suggestion { id: string; confidence: number; }

const _cache = new Map<string, Suggestion>();

export function useAISuggestion(
  description: string,
  type:        "INCOME" | "EXPENSE",
  categories:  Category[]
) {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [aiLoading,  setLoading]    = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (description.length < 3) { setSuggestion(null); return; }

    const key = `${type}|${description.toLowerCase().trim()}`;
    if (_cache.has(key)) { setSuggestion(_cache.get(key)!); return; }

    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/classify", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ description, type, categories }),
        });
        if (!res.ok) throw new Error();
        const result: Suggestion = await res.json();
        _cache.set(key, result);
        setSuggestion(result);
      } catch {
        setSuggestion(null);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer.current);
  }, [description, type]);

  return { suggestion, aiLoading };
}

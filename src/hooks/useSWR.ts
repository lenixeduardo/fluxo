// src/hooks/useSWR.ts
// Custom SWR implementation — same contract as the `swr` package.
// Features: global Map cache, in-flight deduplication, revalidate-on-focus,
// optimistic mutations with automatic rollback.

import { useState, useEffect, useCallback, useRef, useReducer } from "react";

const _cache  = new Map<string, { data: unknown; error: unknown; ts: number }>();
const _subs   = new Map<string, Set<() => void>>();
const _flying = new Map<string, Promise<unknown>>();
const STALE   = 30_000;

function notify(key: string) { _subs.get(key)?.forEach((fn) => fn()); }

interface SWROptions {
  revalidateOnFocus?: boolean;
  dedupingInterval?:  number;
}

interface SWRResult<T> {
  data:       T | undefined;
  error:      unknown;
  isLoading:  boolean;
  mutate:     (updaterOrData: ((prev?: T) => Promise<T>) | T, opts?: MutateOptions<T>) => Promise<T | undefined>;
  revalidate: (force?: boolean) => Promise<void>;
}

interface MutateOptions<T> {
  optimisticData?:  T;
  rollbackOnError?: boolean;
}

export function useSWR<T = unknown>(
  key:     string | null,
  fetcher: (() => Promise<T>) | null,
  opts:    SWROptions = {}
): SWRResult<T> {
  const { revalidateOnFocus = true, dedupingInterval = 2000 } = opts;
  const [, tick] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (!key) return;
    if (!_subs.has(key)) _subs.set(key, new Set());
    _subs.get(key)!.add(tick);
    return () => { _subs.get(key)?.delete(tick); };
  }, [key]);

  const doFetch = useCallback(async (force = false) => {
    if (!key || !fetcher) return;
    if (_flying.has(key)) return _flying.get(key);
    const hit = _cache.get(key);
    if (!force && hit?.ts && Date.now() - hit.ts < dedupingInterval) return;

    const p = fetcher()
      .then((data) => { _cache.set(key, { data, error: null, ts: Date.now() }); notify(key); })
      .catch((err) => { _cache.set(key, { ...(_cache.get(key) ?? {}), error: err, ts: Date.now() }); notify(key); })
      .finally(()  => _flying.delete(key));
    _flying.set(key, p);
    return p;
  }, [key, fetcher, dedupingInterval]);

  useEffect(() => { doFetch(); }, [doFetch]);

  useEffect(() => {
    if (!revalidateOnFocus || !key) return;
    const h = () => { const hit = _cache.get(key); if (!hit?.ts || Date.now() - hit.ts > STALE) doFetch(true); };
    window.addEventListener("focus", h);
    return () => window.removeEventListener("focus", h);
  }, [key, doFetch, revalidateOnFocus]);

  const mutateRef = useRef<SWRResult<T>["mutate"] | null>(null);
  mutateRef.current = async (updaterOrData, mutOpts = {}) => {
    const { optimisticData, rollbackOnError = true } = mutOpts;
    const prev = (_cache.get(key!) as any)?.data as T | undefined;
    if (optimisticData !== undefined) {
      _cache.set(key!, { data: optimisticData, error: null, ts: Date.now() });
      notify(key!);
    }
    if (typeof updaterOrData === "function") {
      try {
        const result = await (updaterOrData as (p?: T) => Promise<T>)(prev);
        _cache.set(key!, { data: result, error: null, ts: Date.now() });
        notify(key!);
        return result;
      } catch (e) {
        if (rollbackOnError) { _cache.set(key!, { data: prev, error: null, ts: Date.now() }); notify(key!); }
        throw e;
      }
    } else {
      _cache.set(key!, { data: updaterOrData, error: null, ts: Date.now() });
      notify(key!);
      return updaterOrData;
    }
  };
  const mutate = useCallback((...args: Parameters<SWRResult<T>["mutate"]>) => mutateRef.current!(...args), []);

  const hit = _cache.get(key ?? "") ?? {};
  return {
    data:       (hit as any).data as T | undefined,
    error:      (hit as any).error,
    isLoading:  !(hit as any).data && !(hit as any).error,
    mutate,
    revalidate: doFetch,
  };
}

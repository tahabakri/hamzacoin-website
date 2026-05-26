// ============================================================================
// useTransferMemos.ts — persist Send HMZ memos so they survive page reloads
// ----------------------------------------------------------------------------
// The ERC20 standard doesn't carry text on-chain, so the user's "Note for
// yourself" lives in browser localStorage. We key by transaction hash so
// when the on-chain history reloads, we can re-attach the original memo to
// each transfer row.
//
// Storage shape: { [txHashLower]: { memo: string; savedAt: number } }
// Cap: 200 most-recent memos (old ones drop off when full).
// ============================================================================

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "hmz-memos-v1";
const MAX_MEMOS = 200;

type Stored = { memo: string; savedAt: number };
type MemoStore = Record<string, Stored>;

const readStored = (): MemoStore => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const out: MemoStore = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (
        typeof v === "object" &&
        v !== null &&
        typeof (v as Stored).memo === "string" &&
        typeof (v as Stored).savedAt === "number"
      ) {
        out[k.toLowerCase()] = v as Stored;
      }
    }
    return out;
  } catch {
    return {};
  }
};

const writeStored = (store: MemoStore): void => {
  if (typeof window === "undefined") return;
  try {
    const entries = Object.entries(store);
    if (entries.length > MAX_MEMOS) {
      entries.sort((a, b) => b[1].savedAt - a[1].savedAt);
      const trimmed: MemoStore = {};
      for (const [k, v] of entries.slice(0, MAX_MEMOS)) {
        trimmed[k] = v;
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
  } catch {
    // ignore quota
  }
};

export type TransferMemosApi = {
  /** Get the saved memo for a tx hash, or undefined if none. */
  getMemo: (txHash: string | undefined | null) => string | undefined;
  /** Save a memo for a tx hash. Empty / whitespace-only memos are ignored. */
  saveMemo: (txHash: string, memo: string) => void;
  /** Remove the saved memo for a single tx hash. */
  removeMemo: (txHash: string) => void;
  /** Wipe all saved memos. */
  clearAll: () => void;
  /** How many memos are currently saved. */
  count: number;
};

export function useTransferMemos(): TransferMemosApi {
  const [store, setStore] = useState<MemoStore>(readStored);

  useEffect(() => {
    writeStored(store);
  }, [store]);

  const getMemo = useCallback(
    (txHash: string | undefined | null): string | undefined => {
      if (!txHash) return undefined;
      return store[txHash.toLowerCase()]?.memo;
    },
    [store],
  );

  const saveMemo = useCallback((txHash: string, memo: string) => {
    if (!txHash) return;
    const trimmed = memo.trim();
    if (!trimmed) return;
    const key = txHash.toLowerCase();
    setStore((prev) => ({
      ...prev,
      [key]: { memo: trimmed, savedAt: Date.now() },
    }));
  }, []);

  const removeMemo = useCallback((txHash: string) => {
    if (!txHash) return;
    const key = txHash.toLowerCase();
    setStore((prev) => {
      if (!(key in prev)) return prev;
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAll = useCallback(() => setStore({}), []);

  // Memoize the returned object so its identity is stable across renders that
  // don't change `store`. Without this, every render of any component that
  // calls useTransferMemos hands consumers a brand-new object — which breaks
  // useCallback/useEffect deps downstream and causes infinite re-render
  // loops in hooks that depend on the memos API (e.g. useHmzContract).
  return useMemo(
    () => ({
      getMemo,
      saveMemo,
      removeMemo,
      clearAll,
      count: Object.keys(store).length,
    }),
    [getMemo, saveMemo, removeMemo, clearAll, store],
  );
}

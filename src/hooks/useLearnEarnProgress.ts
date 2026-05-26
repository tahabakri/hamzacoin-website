// ============================================================================
// useLearnEarnProgress.ts — localStorage tracker for completed Learn & Earn
// ----------------------------------------------------------------------------
// Just a UI hint — the real "you can't claim again" check is enforced by the
// contract's `claimed` mapping. localStorage is purely for showing the user
// "you've already earned for this article" without paying for an RPC call.
// ============================================================================

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hmz-learn-earn-v1";

export type CompletedEntry = {
  articleHash: string;
  articleTitle: string;
  displayTitle: string;
  score: number;
  earnedHmz: number;
  completedAt: number;
  txHash?: string;
};

type StoredShape = {
  entries: CompletedEntry[];
};

function readStorage(): StoredShape {
  if (typeof window === "undefined") return { entries: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [] };
    const parsed = JSON.parse(raw) as Partial<StoredShape>;
    if (!parsed || !Array.isArray(parsed.entries)) return { entries: [] };
    return { entries: parsed.entries };
  } catch {
    return { entries: [] };
  }
}

function writeStorage(value: StoredShape): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export type LearnEarnProgressApi = {
  entries: CompletedEntry[];
  totalEarned: number;
  add: (entry: CompletedEntry) => void;
  has: (articleHash: string) => boolean;
  clear: () => void;
};

export function useLearnEarnProgress(): LearnEarnProgressApi {
  const [entries, setEntries] = useState<CompletedEntry[]>([]);

  useEffect(() => {
    setEntries(readStorage().entries);
  }, []);

  const add = useCallback((entry: CompletedEntry) => {
    setEntries((prev) => {
      // De-dupe by articleHash — replace if it exists.
      const filtered = prev.filter((e) => e.articleHash !== entry.articleHash);
      const next = [entry, ...filtered].slice(0, 50);
      writeStorage({ entries: next });
      return next;
    });
  }, []);

  const has = useCallback(
    (articleHash: string) => entries.some((e) => e.articleHash === articleHash),
    [entries],
  );

  const clear = useCallback(() => {
    setEntries([]);
    writeStorage({ entries: [] });
  }, []);

  const totalEarned = entries.reduce((s, e) => s + e.earnedHmz, 0);

  return { entries, totalEarned, add, has, clear };
}

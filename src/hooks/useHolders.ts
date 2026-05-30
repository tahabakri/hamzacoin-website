// ============================================================================
// useHolders.ts — all-time HMZ holder count from the backend (Etherscan-backed)
// ----------------------------------------------------------------------------
// GET /api/holders reconstructs holders from the full Transfer log via
// Etherscan, which the recent-block-window count (useTransferHistory) can't see.
// On ANY failure (backend down, key unset → 503, Etherscan error → 502) we leave
// count null with source null, so the caller falls back to the recent-window
// count instead of surfacing an error.
// ============================================================================

import { useEffect, useState } from "react";
import { BACKEND_URL } from "../utils/constants";

export type HoldersState = {
  /** All-time holder count from Etherscan, or null when unavailable (→ fall back). */
  count: number | null;
  /** Highest block scanned, or null. */
  asOfBlock: number | null;
  /** "etherscan" on success, null while loading or after a failure. */
  source: "etherscan" | null;
  isLoading: boolean;
  error: string | null;
};

type HoldersResponse = {
  holderCount: number;
  asOfBlock: number;
  source: "etherscan";
};

export function useHolders(): HoldersState {
  const [state, setState] = useState<HoldersState>({
    count: null,
    asOfBlock: null,
    source: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/holders`);
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Holders request failed (${res.status})`);
        }
        const data = (await res.json()) as HoldersResponse;
        if (cancelled) return;
        setState({
          count: typeof data.holderCount === "number" ? data.holderCount : null,
          asOfBlock: typeof data.asOfBlock === "number" ? data.asOfBlock : null,
          source: "etherscan",
          isLoading: false,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setState({
          count: null,
          asOfBlock: null,
          source: null,
          isLoading: false,
          error: (err as Error)?.message ?? "Could not load holders",
        });
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

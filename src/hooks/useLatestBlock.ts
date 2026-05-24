import { useEffect, useState } from "react";
import { useReadOnlyContract } from "./useReadOnlyContract";

const POLL_MS = 12_000;

export type LatestBlockState = {
  blockNumber: number | null;
  lastChangeAt: number | null;
};

export function useLatestBlock(): LatestBlockState {
  const { provider } = useReadOnlyContract();
  const [state, setState] = useState<LatestBlockState>({
    blockNumber: null,
    lastChangeAt: null,
  });

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      try {
        const bn = await provider.getBlockNumber();
        if (cancelled) return;
        setState((prev) =>
          prev.blockNumber === bn
            ? prev
            : { blockNumber: bn, lastChangeAt: Date.now() },
        );
      } catch {
        // transient RPC hiccup — try again next interval
      }
    };

    void tick();
    timer = setInterval(() => {
      void tick();
    }, POLL_MS);

    const onVisible = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        void tick();
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisible);
    }

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisible);
      }
    };
  }, [provider]);

  return state;
}

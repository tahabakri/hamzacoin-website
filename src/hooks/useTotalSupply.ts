import { useEffect, useState } from "react";
import { TOTAL_SUPPLY_POLL_MS } from "../utils/constants";
import { useReadOnlyContract } from "./useReadOnlyContract";

export type TotalSupplyState = {
  totalSupply: bigint | null;
  decimals: bigint | null;
  isLoading: boolean;
  error: string | null;
};

export function useTotalSupply(): TotalSupplyState {
  const { contract } = useReadOnlyContract();
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null);
  const [decimals, setDecimals] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSupply = async () => {
      try {
        const [dec, supply] = await Promise.all([
          contract.decimals() as Promise<bigint>,
          contract.totalSupply() as Promise<bigint>,
        ]);
        if (cancelled) return;
        setDecimals(dec);
        setTotalSupply(supply);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof Error ? err.message : "Failed to read total supply";
        setError(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchSupply();

    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchSupply();
      }
    }, TOTAL_SUPPLY_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [contract]);

  return { totalSupply, decimals, isLoading, error };
}

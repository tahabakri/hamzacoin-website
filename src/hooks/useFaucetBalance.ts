// ============================================================================
// useFaucetBalance.ts — live read of the HamzaFaucet's HMZ balance
// ----------------------------------------------------------------------------
// Surfaces a real number on the Hero ("Learn & Earn faucet: N HMZ available")
// instead of inventing one. Returns null + isConfigured=false when the env
// var VITE_FAUCET_ADDRESS is empty, so the UI can render a clean
// "Not configured yet" fallback.
// ============================================================================

import { useEffect, useState } from "react";
import { Contract, formatUnits } from "ethers";
import { FAUCET_ABI, FAUCET_ADDRESS } from "../utils/constants";
import { useReadOnlyContract } from "./useReadOnlyContract";

const POLL_MS = 30_000;

export type FaucetBalanceState = {
  /** Raw on-chain balance in wei units, or null when not yet read / not configured. */
  balance: bigint | null;
  /** True when VITE_FAUCET_ADDRESS is set to a non-empty value. */
  isConfigured: boolean;
  /** True between request start and first response. */
  isLoading: boolean;
  /** Friendly error string, or null. */
  error: string | null;
};

const EMPTY: FaucetBalanceState = {
  balance: null,
  isConfigured: false,
  isLoading: false,
  error: null,
};

export function useFaucetBalance(): FaucetBalanceState {
  const { provider } = useReadOnlyContract();
  const [state, setState] = useState<FaucetBalanceState>({
    ...EMPTY,
    isConfigured: FAUCET_ADDRESS.length > 0,
  });

  useEffect(() => {
    if (!FAUCET_ADDRESS) return;

    let cancelled = false;
    const contract = new Contract(FAUCET_ADDRESS, FAUCET_ABI, provider);

    const read = async () => {
      if (!cancelled) {
        setState((s) => ({ ...s, isLoading: s.balance === null, error: null }));
      }
      try {
        const raw = (await contract.faucetBalance()) as bigint;
        if (cancelled) return;
        setState({
          balance: raw,
          isConfigured: true,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setState({
          balance: null,
          isConfigured: true,
          isLoading: false,
          error:
            (err as Error)?.message ??
            "Could not read faucet balance",
        });
      }
    };

    void read();
    const id = window.setInterval(() => void read(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [provider]);

  return state;
}

/** Format the raw balance as a whole-number HMZ string (rewards are whole units). */
export function formatFaucetHmz(balance: bigint | null): string {
  if (balance === null) return "—";
  const whole = Math.floor(Number(formatUnits(balance, 18)));
  return whole.toLocaleString();
}

import { useCallback, useMemo } from "react";

export type HapticApi = {
  supported: boolean;
  vibrateSuccess: () => void;
  vibrateError: () => void;
};

export function useHaptic(): HapticApi {
  const supported = useMemo<boolean>(() => {
    if (typeof navigator === "undefined") return false;
    return typeof navigator.vibrate === "function";
  }, []);

  const vibrateSuccess = useCallback(() => {
    if (!supported) return;
    try {
      navigator.vibrate(50);
    } catch {
      // some browsers throw if vibrate is restricted
    }
  }, [supported]);

  const vibrateError = useCallback(() => {
    if (!supported) return;
    try {
      navigator.vibrate([30, 50, 30]);
    } catch {
      // ignore
    }
  }, [supported]);

  return { supported, vibrateSuccess, vibrateError };
}

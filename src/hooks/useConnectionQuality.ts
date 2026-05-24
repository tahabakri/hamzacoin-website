import { useEffect, useState } from "react";

export type ConnectionQuality = "fast" | "slow";

type NetworkInfo = {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (event: string, handler: () => void) => void;
  removeEventListener?: (event: string, handler: () => void) => void;
};

const readQuality = (): ConnectionQuality => {
  if (typeof navigator === "undefined") return "fast";
  const nav = navigator as Navigator & { connection?: NetworkInfo };
  const info = nav.connection;
  if (!info) return "fast";
  if (info.saveData) return "slow";
  const t = info.effectiveType;
  if (t === "slow-2g" || t === "2g" || t === "3g") return "slow";
  return "fast";
};

// Reads navigator.connection.effectiveType when available; falls back to
// "fast" so non-supporting browsers never trigger the degraded path.
export function useConnectionQuality(): ConnectionQuality {
  const [quality, setQuality] = useState<ConnectionQuality>(readQuality);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const nav = navigator as Navigator & { connection?: NetworkInfo };
    const info = nav.connection;
    if (!info?.addEventListener) return;
    const onChange = () => setQuality(readQuality());
    info.addEventListener("change", onChange);
    return () => info.removeEventListener?.("change", onChange);
  }, []);

  return quality;
}

// Static (no React) helper for one-shot reads inside other effects.
export const getConnectionQuality = readQuality;

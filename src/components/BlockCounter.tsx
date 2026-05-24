import { useEffect, useState } from "react";
import { useLatestBlock } from "../hooks/useLatestBlock";
import { AnimatedNumber } from "./AnimatedNumber";

type Props = {
  reduceMotion: boolean;
};

export function BlockCounter({ reduceMotion }: Props) {
  const { blockNumber, lastChangeAt } = useLatestBlock();
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!lastChangeAt) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 900);
    return () => clearTimeout(t);
  }, [lastChangeAt]);

  if (blockNumber === null) {
    return (
      <div
        className="hidden md:inline-flex items-center gap-2 rounded-full bg-white/70 border border-coffee-200 px-3 py-1.5"
        aria-label="Connecting to Sepolia"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-coffee-300"></span>
        <span className="font-mono text-[10px] text-coffee-500">
          syncing…
        </span>
      </div>
    );
  }

  return (
    <div
      className="hidden md:inline-flex items-center gap-2 rounded-full bg-white/70 border border-coffee-200 px-3 py-1.5 group relative"
      role="status"
      aria-label={`Latest Sepolia block ${blockNumber}`}
      title="New block every ~12 seconds on Sepolia"
    >
      <span
        className={`relative flex items-center justify-center w-1.5 h-1.5 ${
          reduceMotion ? "" : "hmz-pulse-live"
        }`}
      >
        <span className="absolute inset-0 rounded-full bg-emerald-500"></span>
      </span>
      <span className="font-mono text-[10px] text-coffee-500 leading-none uppercase tracking-wider">
        Block
      </span>
      <span
        className={`font-mono text-[11px] font-semibold text-coffee-950 tabular-nums leading-none transition-colors ${
          flash && !reduceMotion ? "text-emerald-700" : ""
        }`}
      >
        <AnimatedNumber
          value={blockNumber}
          enabled={!reduceMotion}
          durationMs={600}
        />
      </span>
      <span
        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-50 whitespace-nowrap rounded-lg bg-coffee-950 text-white text-[10px] font-light px-2 py-1 shadow-lg pointer-events-none"
        role="tooltip"
      >
        New block every ~12s on Sepolia
      </span>
    </div>
  );
}

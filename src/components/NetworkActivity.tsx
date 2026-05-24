import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { formatAddress } from "../utils/format";
import { MAX_FEED_ITEMS, SEPOLIA_EXPLORER } from "../utils/constants";
import type { LiveTransfer } from "../hooks/useTransferEvents";
import { RelativeTime } from "./RelativeTime";

type Props = {
  realEvents: LiveTransfer[];
  ghostEvents: LiveTransfer[];
  demoMode: boolean;
};

export function NetworkActivity({ realEvents, ghostEvents, demoMode }: Props) {
  const events = useMemo<LiveTransfer[]>(() => {
    const merged = [...realEvents, ...ghostEvents];
    merged.sort((a, b) => b.timestamp - a.timestamp);
    return merged.slice(0, MAX_FEED_ITEMS);
  }, [realEvents, ghostEvents]);

  return (
    <section
      id="network-activity"
      className="max-w-7xl mx-auto px-6 py-20"
      aria-label="Live network activity"
    >
      <div className="text-center max-w-3xl mx-auto mb-10">
        <p className="font-mono text-xs font-semibold tracking-[-0.04em] text-coffee-600 mb-4">
          LIVE NETWORK ACTIVITY
        </p>
        <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-coffee-950 leading-[1.05]">
          Every transfer,
          <span className="block font-semibold italic text-coffee-800">
            in real time.
          </span>
        </h2>
        <p className="mt-5 text-base leading-7 text-coffee-700 font-light">
          Live feed of every HamzaCoin transfer on Sepolia — yours and everyone
          else's. Streamed directly from the contract, no backend in between.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[2.25rem] bg-white/70 backdrop-blur-xl border border-white shadow-[0_30px_80px_-45px_rgba(67,48,36,0.25),inset_0_1px_0_rgba(255,255,255,1)] p-4 md:p-6">
        <div className="flex items-center justify-between px-2 pb-4 border-b border-coffee-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-coffee-950">
              Sepolia testnet stream
            </span>
            {demoMode && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                <span>👻</span> Demo mode on
              </span>
            )}
          </div>
          <span className="font-mono text-[10px] text-coffee-500">
            {events.length} / 20
          </span>
        </div>

        {events.length === 0 ? (
          <div className="py-16 text-center text-sm text-coffee-500 font-light">
            <Icon
              icon="solar:satellite-linear"
              className="text-3xl text-coffee-300 mx-auto mb-3"
            />
            Waiting for the next transfer on-chain…
          </div>
        ) : (
          <ul className="divide-y divide-coffee-100" aria-live="polite">
            {events.map((ev) => (
              <li
                key={ev.id}
                className={`hmz-row-in px-2 py-3 grid grid-cols-[1fr_auto] gap-2 items-start ${
                  ev.isGhost ? "hmz-ghost-row" : ""
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-coffee-500">
                    {ev.isGhost && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-1.5 py-0.5 text-[9px] font-semibold text-violet-700"
                        aria-label="Simulated transaction"
                      >
                        <span>👻</span>
                        demo
                      </span>
                    )}
                    <span>{formatAddress(ev.from)}</span>
                    <Icon
                      icon="solar:arrow-right-linear"
                      className="text-coffee-400"
                    />
                    <span>{formatAddress(ev.to)}</span>
                    <span className="text-coffee-300">·</span>
                    <RelativeTime
                      timestamp={ev.timestamp}
                      className="text-coffee-400"
                    />
                  </div>
                  {ev.isGhost && ev.memo && (
                    <p className="mt-1 text-[11px] text-coffee-600 font-light italic truncate">
                      “{ev.memo}”
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {ev.isGhost ? (
                    <span className="text-xs font-bold text-violet-700 inline-flex items-center gap-1">
                      +{parseFloat(ev.amount).toFixed(2)} HMZ
                    </span>
                  ) : (
                    <a
                      href={`${SEPOLIA_EXPLORER}/tx/${ev.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-coffee-800 hover:text-coffee-950 inline-flex items-center gap-1"
                    >
                      +{parseFloat(ev.amount).toFixed(2)} HMZ
                      <Icon
                        icon="solar:arrow-right-up-linear"
                        className="text-coffee-400"
                      />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

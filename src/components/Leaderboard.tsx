import { Icon } from "@iconify/react";
import { formatAddress } from "../utils/format";
import { SEPOLIA_EXPLORER } from "../utils/constants";
import type { LeaderboardEntry } from "../utils/transfers";

type Props = {
  entries: LeaderboardEntry[];
  isLoading: boolean;
};

export function Leaderboard({ entries, isLoading }: Props) {
  const maxCount = entries.reduce((m, e) => Math.max(m, e.count), 0);

  return (
    <div
      className="rounded-[clamp(1rem,3vw,1.85rem)] bg-white/80 backdrop-blur border border-coffee-200 p-4 sm:p-5 md:p-6 shadow-[inset_0_1px_0_white]"
      aria-label="Most active senders"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-coffee-500 font-semibold">
            MOST ACTIVE SENDERS
          </p>
          <h3 className="mt-1 text-lg font-bold text-coffee-950">
            Top 10 by transfer count
          </h3>
        </div>
        <Icon
          icon="solar:medal-ribbons-star-linear"
          className="text-2xl text-coffee-600"
        />
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-coffee-500 font-light">
          Loading from chain…
        </div>
      ) : entries.length === 0 ? (
        <div className="py-12 text-center text-xs text-coffee-500 font-light">
          No transfers recorded in the last 50,000 blocks.
        </div>
      ) : (
        <ol className="space-y-3" aria-label="Leaderboard">
          {entries.map((entry, idx) => {
            const barWidth =
              maxCount > 0 ? Math.max(8, (entry.count / maxCount) * 100) : 0;
            return (
              <li
                key={entry.address}
                className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3"
              >
                <span
                  className={`text-xs font-mono font-semibold text-center ${
                    idx < 3 ? "text-coffee-900" : "text-coffee-400"
                  }`}
                >
                  {idx + 1}
                </span>
                <div>
                  <a
                    href={`${SEPOLIA_EXPLORER}/address/${entry.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-coffee-800 hover:text-coffee-950 underline-offset-2 hover:underline"
                  >
                    {formatAddress(entry.address)}
                  </a>
                  <div
                    className="mt-1 h-1.5 rounded-full bg-coffee-100 overflow-hidden"
                    role="presentation"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-coffee-600 to-coffee-800 rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold text-coffee-950 tabular-nums">
                  {entry.count}{" "}
                  <span className="text-coffee-500 font-light">
                    {entry.count === 1 ? "tx" : "txs"}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

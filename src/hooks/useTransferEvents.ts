import { useEffect, useState } from "react";
import { formatUnits, type EventLog } from "ethers";
import { MAX_FEED_ITEMS } from "../utils/constants";
import { decodeTransferArgs } from "../utils/transfers";
import { useReadOnlyContract } from "./useReadOnlyContract";

export type LiveTransfer = {
  id: string;
  from: string;
  to: string;
  amount: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
};

// How far back to seed the feed on mount. Sepolia averages ~12s/block, so 5000
// blocks is ~16 hours of activity — enough to show recent transfers without
// hitting eth_getLogs range limits on free public RPCs.
const BACKFILL_BLOCKS = 5_000n;

export function useTransferEvents(decimals: bigint | null): LiveTransfer[] {
  const { contract, provider } = useReadOnlyContract();
  const [events, setEvents] = useState<LiveTransfer[]>([]);

  // Initial backfill: pull recent history so the feed isn't empty on page load.
  useEffect(() => {
    if (!decimals) return;

    let cancelled = false;

    const backfill = async () => {
      try {
        const currentBlock = BigInt(await provider.getBlockNumber());
        const fromBlock =
          currentBlock > BACKFILL_BLOCKS ? currentBlock - BACKFILL_BLOCKS : 0n;

        const filter = contract.filters.Transfer();
        const raw = (await contract.queryFilter(
          filter,
          fromBlock,
          currentBlock,
        )) as EventLog[];

        if (cancelled || raw.length === 0) return;

        // Sort newest-first, take the most recent MAX_FEED_ITEMS
        const recent = [...raw]
          .filter(
            (e): e is EventLog =>
              "args" in e && e.args !== undefined && e.args !== null,
          )
          .sort(
            (a, b) =>
              b.blockNumber - a.blockNumber || (b.index ?? 0) - (a.index ?? 0),
          )
          .slice(0, MAX_FEED_ITEMS);

        const blockNumbers = Array.from(
          new Set(recent.map((e) => e.blockNumber)),
        );
        const blockTimestamps = new Map<number, number>();
        await Promise.all(
          blockNumbers.map(async (bn) => {
            try {
              const block = await provider.getBlock(bn);
              if (block?.timestamp) {
                blockTimestamps.set(bn, block.timestamp * 1000);
              }
            } catch {
              // skip
            }
          }),
        );

        if (cancelled) return;

        const seeded: LiveTransfer[] = recent.map((e) => ({
          id: `${e.transactionHash}-${e.index ?? 0}`,
          from: e.args?.[0] as string,
          to: e.args?.[1] as string,
          amount: formatUnits(e.args?.[2] as bigint, decimals),
          txHash: e.transactionHash,
          blockNumber: e.blockNumber,
          timestamp: blockTimestamps.get(e.blockNumber) ?? Date.now(),
        }));

        setEvents((prev) => {
          // Don't clobber any live events that arrived before backfill finished
          const known = new Set(prev.map((e) => e.id));
          const merged = [...prev, ...seeded.filter((e) => !known.has(e.id))];
          merged.sort((a, b) => b.blockNumber - a.blockNumber);
          return merged.slice(0, MAX_FEED_ITEMS);
        });
      } catch (err) {
        console.warn("Live feed backfill failed", err);
      }
    };

    void backfill();

    return () => {
      cancelled = true;
    };
  }, [contract, provider, decimals]);

  // Live append: subscribe to new Transfer events
  useEffect(() => {
    if (!decimals) return;

    let cancelled = false;
    const filter = contract.filters.Transfer();

    const handler = async (...args: unknown[]) => {
      if (cancelled) return;

      try {
        const decoded = decodeTransferArgs(args);
        if (!decoded) return;
        const { from, to, value, log } = decoded;
        if (!log || typeof log.blockNumber !== "number") return;

        let timestamp = Date.now();
        try {
          const block = await provider.getBlock(log.blockNumber);
          if (block?.timestamp) {
            timestamp = block.timestamp * 1000;
          }
        } catch {
          // fall back to now()
        }

        if (cancelled) return;

        setEvents((prev) => {
          const id = `${log.transactionHash}-${log.index ?? 0}`;
          if (prev.some((e) => e.id === id)) return prev;
          const next: LiveTransfer = {
            id,
            from,
            to,
            amount: formatUnits(value, decimals),
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            timestamp,
          };
          return [next, ...prev].slice(0, MAX_FEED_ITEMS);
        });
      } catch (err) {
        console.warn("Skipping malformed Transfer event", err);
      }
    };

    void contract.on(filter, handler);

    return () => {
      cancelled = true;
      void contract.off(filter, handler);
    };
  }, [contract, provider, decimals]);

  return events;
}

import { useEffect, useState } from "react";
import { formatUnits, type EventLog } from "ethers";
import { MAX_FEED_ITEMS } from "../utils/constants";
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

export function useTransferEvents(decimals: bigint | null): LiveTransfer[] {
  const { contract, provider } = useReadOnlyContract();
  const [events, setEvents] = useState<LiveTransfer[]>([]);

  useEffect(() => {
    if (!decimals) return;

    let cancelled = false;
    const filter = contract.filters.Transfer();

    const handler = async (...args: unknown[]) => {
      if (cancelled) return;
      const eventLog = args[args.length - 1] as EventLog;
      const from = args[0] as string;
      const to = args[1] as string;
      const value = args[2] as bigint;

      let timestamp = Date.now();
      try {
        const block = await provider.getBlock(eventLog.blockNumber);
        if (block?.timestamp) {
          timestamp = block.timestamp * 1000;
        }
      } catch {
        // fall back to now()
      }

      if (cancelled) return;

      setEvents((prev) => {
        const id = `${eventLog.transactionHash}-${eventLog.index}`;
        if (prev.some((e) => e.id === id)) return prev;
        const next: LiveTransfer = {
          id,
          from,
          to,
          amount: formatUnits(value, decimals),
          txHash: eventLog.transactionHash,
          blockNumber: eventLog.blockNumber,
          timestamp,
        };
        return [next, ...prev].slice(0, MAX_FEED_ITEMS);
      });
    };

    void contract.on(filter, handler);

    return () => {
      cancelled = true;
      void contract.off(filter, handler);
    };
  }, [contract, provider, decimals]);

  return events;
}

import { useEffect, useMemo, useState } from "react";
import { type EventLog } from "ethers";
import { HISTORY_BLOCK_RANGE } from "../utils/constants";
import {
  computeHolders,
  groupByDay,
  topSenders,
  type DailyVolumePoint,
  type LeaderboardEntry,
  type RawTransferEvent,
} from "../utils/transfers";
import { useReadOnlyContract } from "./useReadOnlyContract";

export type TransferHistoryState = {
  events: RawTransferEvent[];
  decimals: bigint | null;
  holderCount: number;
  dailyVolume: DailyVolumePoint[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
};

export function useTransferHistory(): TransferHistoryState {
  const { contract, provider } = useReadOnlyContract();
  const [events, setEvents] = useState<RawTransferEvent[]>([]);
  const [decimals, setDecimals] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const dec = (await contract.decimals()) as bigint;
        if (cancelled) return;
        setDecimals(dec);

        const currentBlock = BigInt(await provider.getBlockNumber());
        const fromBlock =
          currentBlock > HISTORY_BLOCK_RANGE
            ? currentBlock - HISTORY_BLOCK_RANGE
            : 0n;

        const filter = contract.filters.Transfer();
        const rawEvents = (await contract.queryFilter(
          filter,
          fromBlock,
          currentBlock,
        )) as EventLog[];

        if (cancelled) return;

        // Batch-fetch block timestamps; multiple events may share a block
        const blockNumbers = Array.from(
          new Set(rawEvents.map((e) => e.blockNumber)),
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

        const parsed: RawTransferEvent[] = rawEvents
          .filter(
            (e): e is EventLog =>
              "args" in e && e.args !== undefined && e.args !== null,
          )
          .map((e) => ({
            from: e.args?.[0] as string,
            to: e.args?.[1] as string,
            value: e.args?.[2] as bigint,
            blockNumber: e.blockNumber,
            blockTimestampMs:
              blockTimestamps.get(e.blockNumber) ?? Date.now(),
            txHash: e.transactionHash,
            logIndex: e.index,
          }))
          .sort((a, b) => b.blockNumber - a.blockNumber);

        if (cancelled) return;
        setEvents(parsed);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof Error ? err.message : "Could not load history";
        setError(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [contract, provider]);

  const holderCount = useMemo(
    () => (decimals ? computeHolders(events).count : 0),
    [events, decimals],
  );

  const dailyVolume = useMemo(
    () => (decimals ? groupByDay(events, decimals, 30) : []),
    [events, decimals],
  );

  const leaderboard = useMemo(
    () => (decimals ? topSenders(events, decimals, 10) : []),
    [events, decimals],
  );

  return {
    events,
    decimals,
    holderCount,
    dailyVolume,
    leaderboard,
    isLoading,
    error,
  };
}

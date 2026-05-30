import { formatUnits, type EventLog, type Log } from "ethers";

export type RawTransferEvent = {
  from: string;
  to: string;
  value: bigint;
  blockNumber: number;
  /** ms since epoch, or null when the block timestamp couldn't be resolved. */
  blockTimestampMs: number | null;
  txHash: string;
  logIndex: number;
};

type AnyEventPayload = {
  args?: ReadonlyArray<unknown>;
  log?: Log;
} & Partial<EventLog>;

const isHexAddress = (v: unknown): v is string =>
  typeof v === "string" && v.startsWith("0x");

const isBigIntish = (v: unknown): v is bigint | string =>
  typeof v === "bigint" || (typeof v === "string" && /^[0-9]+$/.test(v));

// ethers v6 listeners can be called with either:
//   (from, to, value, payload)  — flat decoded args
//   (payload)                    — single ContractEventPayload
// Normalise to one shape; return null if we can't decode.
export const decodeTransferArgs = (
  args: unknown[],
):
  | { from: string; to: string; value: bigint; log: EventLog }
  | null => {
  if (args.length === 0) return null;

  if (
    args.length >= 4 &&
    isHexAddress(args[0]) &&
    isHexAddress(args[1]) &&
    isBigIntish(args[2])
  ) {
    return {
      from: args[0],
      to: args[1],
      value: BigInt(args[2] as bigint | string),
      log: args[args.length - 1] as EventLog,
    };
  }

  const payload = args[args.length - 1] as AnyEventPayload | undefined;
  if (!payload) return null;
  const inner = payload.args ?? [];
  if (
    inner.length >= 3 &&
    isHexAddress(inner[0]) &&
    isHexAddress(inner[1]) &&
    isBigIntish(inner[2])
  ) {
    const log = (payload.log ?? (payload as unknown as EventLog)) as EventLog;
    return {
      from: inner[0],
      to: inner[1],
      value: BigInt(inner[2] as bigint | string),
      log,
    };
  }

  return null;
};

export type DailyVolumePoint = {
  dateKey: string; // YYYY-MM-DD
  label: string; // "Mar 5"
  volume: number; // HMZ
  count: number;
};

export type LeaderboardEntry = {
  address: string;
  count: number;
  volume: number; // HMZ
};

const DAY_MS = 24 * 60 * 60 * 1000;

const dateKey = (ms: number): string => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
};

const shortLabel = (ms: number): string => {
  const d = new Date(ms);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

export const groupByDay = (
  events: RawTransferEvent[],
  decimals: bigint,
  days: number,
): DailyVolumePoint[] => {
  const now = Date.now();
  const points: DailyVolumePoint[] = [];
  const bucket = new Map<string, { volume: number; count: number }>();

  for (const ev of events) {
    // Skip events whose block timestamp couldn't be resolved — dropping a
    // transfer is better than misdating it into "today" and faking a spike.
    if (ev.blockTimestampMs === null) continue;
    const key = dateKey(ev.blockTimestampMs);
    const entry = bucket.get(key) ?? { volume: 0, count: 0 };
    entry.volume += Number(formatUnits(ev.value, decimals));
    entry.count += 1;
    bucket.set(key, entry);
  }

  for (let i = days - 1; i >= 0; i--) {
    const ms = now - i * DAY_MS;
    const key = dateKey(ms);
    const entry = bucket.get(key) ?? { volume: 0, count: 0 };
    points.push({
      dateKey: key,
      label: shortLabel(ms),
      volume: Math.round(entry.volume * 100) / 100,
      count: entry.count,
    });
  }

  return points;
};

export const computeHolders = (
  events: RawTransferEvent[],
): { count: number; balances: Map<string, bigint> } => {
  const balances = new Map<string, bigint>();
  const ZERO = "0x0000000000000000000000000000000000000000";

  for (const ev of events) {
    if (ev.from.toLowerCase() !== ZERO) {
      const prev = balances.get(ev.from.toLowerCase()) ?? 0n;
      balances.set(ev.from.toLowerCase(), prev - ev.value);
    }
    if (ev.to.toLowerCase() !== ZERO) {
      const prev = balances.get(ev.to.toLowerCase()) ?? 0n;
      balances.set(ev.to.toLowerCase(), prev + ev.value);
    }
  }

  let count = 0;
  for (const bal of balances.values()) {
    if (bal > 0n) count++;
  }
  return { count, balances };
};

export const topSenders = (
  events: RawTransferEvent[],
  decimals: bigint,
  limit = 10,
): LeaderboardEntry[] => {
  const stats = new Map<string, { count: number; volume: bigint }>();
  const ZERO = "0x0000000000000000000000000000000000000000";

  for (const ev of events) {
    if (ev.from.toLowerCase() === ZERO) continue;
    const key = ev.from.toLowerCase();
    const prev = stats.get(key) ?? { count: 0, volume: 0n };
    prev.count += 1;
    prev.volume += ev.value;
    stats.set(key, prev);
  }

  const rows: LeaderboardEntry[] = Array.from(stats.entries()).map(
    ([address, s]) => ({
      address,
      count: s.count,
      volume: Number(formatUnits(s.volume, decimals)),
    }),
  );

  rows.sort((a, b) => b.count - a.count || b.volume - a.volume);
  return rows.slice(0, limit);
};

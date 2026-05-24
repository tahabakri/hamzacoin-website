import { useEffect, useState } from "react";
import type { LiveTransfer } from "./useTransferEvents";
import { MAX_FEED_ITEMS } from "../utils/constants";

const GHOST_INTERVAL_MS = 3_000;

const GHOST_MEMOS: readonly string[] = [
  "Tip Friend: Great recommendation!",
  "Cafe Spot: Quiet corner in Kyoto",
  "Book Rec: The Beauty of Slow Living",
  "Vinyl Drop: Sunday Morning Jazz",
  "Hidden Gem: Riverside bookstore",
  "Late-night brew at Solitude",
  "Outline shared: Notes on stillness",
  "Mixtape: Rainy afternoon edit",
  "Bakery tip: morning sourdough run",
  "Slow Sunday: handwritten letters",
];

// Fixed pool of plausible-looking demo addresses. Reusing them across ghosts
// makes the activity map build up real-feeling edges instead of looking like
// isolated random nodes.
const GHOST_POOL: readonly string[] = [
  "0x3aF89a4d5BE4cFf76902DD0eA1bf2A92b3f59d21",
  "0x12CcDeF9999c2BBE60Aa4f56AABdEa1cfDe5d942",
  "0x89Dfa61eC8a7C772Cd1A4FB6FFc3A24F33d8f551",
  "0x22EeF1a9b73CCcfB8d2A0E0F3a9D1cBd512Da991",
  "0x74Abc83eBb55a59CBaA8932dEf63A7B07A24c112",
  "0x5bD4F0BcA9F7eE3F1F0Ad2Bc6e1bA09F9bC1A483",
  "0xc8d10Fc6E63B5fD3aE2C4d5e7F8aB91cDe2bFa17",
  "0xA1B2C3D4E5F60718293A4B5C6D7E8F9012345678",
  "0xfEEdC0fFee1234D8c5E6f7090aBcDeF012345678",
  "0x9Aa3DD0b5cA70F23B1c5e8Df1a45BcD89eFa0156",
];

const hex = (len: number): string => {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += Math.floor(Math.random() * 16).toString(16);
  }
  return out;
};

const randomAmount = (): string => {
  const whole = 1 + Math.floor(Math.random() * 99);
  const decimals = Math.floor(Math.random() * 100);
  return `${whole}.${decimals.toString().padStart(2, "0")}`;
};

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

const buildGhost = (seed: number): LiveTransfer => {
  const ts = Date.now();
  const from = pick(GHOST_POOL);
  let to = pick(GHOST_POOL);
  while (to === from) to = pick(GHOST_POOL);
  return {
    id: `ghost-${ts}-${seed}-${hex(6)}`,
    from,
    to,
    amount: randomAmount(),
    txHash: `0xghost${seed.toString(16).padStart(8, "0")}`,
    blockNumber: 0,
    timestamp: ts,
    isGhost: true,
    memo: pick(GHOST_MEMOS),
  };
};

export function useGhostTransfers(enabled: boolean): LiveTransfer[] {
  const [ghosts, setGhosts] = useState<LiveTransfer[]>([]);

  useEffect(() => {
    if (!enabled) {
      setGhosts([]);
      return;
    }
    let counter = 0;

    const seed = () => {
      const initial: LiveTransfer[] = [];
      for (let i = 0; i < 8; i++) {
        counter += 1;
        initial.push({
          ...buildGhost(counter),
          timestamp: Date.now() - i * 800,
        });
      }
      setGhosts(initial);
    };

    const emit = () => {
      counter += 1;
      const next = buildGhost(counter);
      setGhosts((prev) => [next, ...prev].slice(0, MAX_FEED_ITEMS));
    };

    seed();
    const id = setInterval(emit, GHOST_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled]);

  return ghosts;
}

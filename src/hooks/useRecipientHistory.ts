import { useCallback, useEffect, useState } from "react";
import { isAddress } from "ethers";

const STORAGE_KEY = "hmz-recipients-v1";
const MAX_ENTRIES = 8;

export type RecipientEntry = {
  address: string;
  lastUsed: number;
};

export type RecipientHistoryApi = {
  entries: RecipientEntry[];
  add: (address: string) => void;
  remove: (address: string) => void;
  clear: () => void;
};

const readStored = (): RecipientEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is RecipientEntry =>
          typeof e === "object" &&
          e !== null &&
          typeof (e as RecipientEntry).address === "string" &&
          typeof (e as RecipientEntry).lastUsed === "number" &&
          isAddress((e as RecipientEntry).address),
      )
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
};

const writeStored = (entries: RecipientEntry[]): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore quota
  }
};

export function useRecipientHistory(): RecipientHistoryApi {
  const [entries, setEntries] = useState<RecipientEntry[]>(readStored);

  useEffect(() => {
    writeStored(entries);
  }, [entries]);

  const add = useCallback((address: string) => {
    if (!isAddress(address)) return;
    const checksummed = address;
    setEntries((prev) => {
      const filtered = prev.filter(
        (e) => e.address.toLowerCase() !== checksummed.toLowerCase(),
      );
      return [
        { address: checksummed, lastUsed: Date.now() },
        ...filtered,
      ].slice(0, MAX_ENTRIES);
    });
  }, []);

  const remove = useCallback((address: string) => {
    setEntries((prev) =>
      prev.filter(
        (e) => e.address.toLowerCase() !== address.toLowerCase(),
      ),
    );
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, add, remove, clear };
}

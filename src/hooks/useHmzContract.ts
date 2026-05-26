import { useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserProvider,
  Contract,
  formatUnits,
  isAddress,
  parseUnits,
  type EventLog,
} from "ethers";
import {
  CONTRACT_ADDRESS,
  HISTORY_BLOCK_RANGE,
  HMZ_ABI,
  SEED_TRANSFERS,
  type Transfer,
} from "../utils/constants";
import { formatAddress } from "../utils/format";
import { friendlyError } from "../utils/errors";
import { useReadOnlyContract } from "./useReadOnlyContract";
import { useTransferMemos } from "./useTransferMemos";

export type TxStatus = {
  success: boolean | null;
  message: string;
  txHash: string;
};

export type HmzContractState = {
  balance: string;
  balanceError: string | null;
  isLoadingBalance: boolean;
  txStatus: TxStatus;
  isTxPending: boolean;
  recentTransfers: Transfer[];
  sendHmz: (
    recipient: string,
    amount: string,
    memo: string,
  ) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  appendLocalTransfer: (entry: {
    from: string;
    to: string;
    amount: string;
    memo: string;
    txHash?: string;
  }) => void;
};

const EMPTY_STATUS: TxStatus = { success: null, message: "", txHash: "" };

// Module-level cache: block timestamps NEVER change once mined, so caching
// them across hook re-runs / component re-mounts cuts ~80% of getBlock calls
// out of loadOnChainHistory. Without this, every reload fires N parallel
// getBlock requests (one per unique block touched by your transfers), which
// is the easiest way to instantly hit the public RPCs' 429 limit.
const blockTimestampCache = new Map<number, number>();

export function useHmzContract(
  walletProvider: BrowserProvider | null,
  account: string,
  ensureSepolia: () => Promise<void>,
): HmzContractState {
  const { contract: readContract, provider: readProvider } =
    useReadOnlyContract();
  const memos = useTransferMemos();

  const [balance, setBalance] = useState("0");
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>(EMPTY_STATUS);
  const [isTxPending, setIsTxPending] = useState(false);
  const [recentTransfers, setRecentTransfers] =
    useState<Transfer[]>(SEED_TRANSFERS);

  const decimalsRef = useRef<bigint | null>(null);

  const getDecimals = useCallback(
    async (contract: Contract): Promise<bigint> => {
      if (decimalsRef.current !== null) return decimalsRef.current;
      const d = (await contract.decimals()) as bigint;
      decimalsRef.current = d;
      return d;
    },
    [],
  );

  // All view calls go through the public FallbackProvider — independent of MetaMask state.
  const refreshBalance = useCallback(async () => {
    if (!account) return;
    try {
      setBalanceError(null);
      setIsLoadingBalance(true);
      const decimals = await getDecimals(readContract);
      const raw = (await readContract.balanceOf(account)) as bigint;
      setBalance(formatUnits(raw, decimals));
    } catch (err) {
      console.error("Error reading balance", err);
      setBalanceError("Could not read balance. Check network and try again.");
    } finally {
      setIsLoadingBalance(false);
    }
  }, [account, readContract, getDecimals]);

  const loadOnChainHistory = useCallback(async () => {
    if (!account) return;
    try {
      const decimals = await getDecimals(readContract);
      const currentBlock = BigInt(await readProvider.getBlockNumber());
      const fromBlock =
        currentBlock > HISTORY_BLOCK_RANGE
          ? currentBlock - HISTORY_BLOCK_RANGE
          : 0n;

      const [outgoing, incoming] = await Promise.all([
        readContract.queryFilter(
          readContract.filters.Transfer(account, null),
          fromBlock,
          currentBlock,
        ),
        readContract.queryFilter(
          readContract.filters.Transfer(null, account),
          fromBlock,
          currentBlock,
        ),
      ]);

      const allEvents = [...outgoing, ...incoming] as EventLog[];

      const uniqueBlocks = Array.from(
        new Set(allEvents.map((e) => e.blockNumber)),
      );
      const blockTimes = new Map<number, number>();
      // Only fetch block timestamps that aren't already cached. Block
      // timestamps are immutable once mined, so the cache is forever-valid.
      const missingBlocks = uniqueBlocks.filter(
        (bn) => !blockTimestampCache.has(bn),
      );
      // Pre-fill from cache
      for (const bn of uniqueBlocks) {
        const cached = blockTimestampCache.get(bn);
        if (cached !== undefined) blockTimes.set(bn, cached);
      }
      // Chunk fetches so we don't blast the RPC with 30 parallel requests
      // when an account has activity across many blocks.
      const CHUNK_SIZE = 5;
      for (let i = 0; i < missingBlocks.length; i += CHUNK_SIZE) {
        const chunk = missingBlocks.slice(i, i + CHUNK_SIZE);
        await Promise.all(
          chunk.map(async (bn) => {
            try {
              const block = await readProvider.getBlock(bn);
              if (block?.timestamp) {
                const ms = block.timestamp * 1000;
                blockTimes.set(bn, ms);
                blockTimestampCache.set(bn, ms);
              }
            } catch {
              // skip — likely 429, will be retried on next load attempt
            }
          }),
        );
      }

      const seen = new Set<string>();
      const onChain: Transfer[] = [];
      for (const e of allEvents) {
        if (!("args" in e) || !e.args) continue;
        const key = `${e.transactionHash}-${e.index}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const from = e.args[0] as string;
        const to = e.args[1] as string;
        const value = e.args[2] as bigint;
        const savedMemo = memos.getMemo(e.transactionHash);
        onChain.push({
          id: Number(BigInt(e.blockNumber) * 1000n + BigInt(e.index)),
          from: formatAddress(from),
          to: formatAddress(to),
          amount: formatUnits(value, decimals),
          recommendation: savedMemo ?? `Transfer on block ${e.blockNumber}`,
          timestamp: blockTimes.get(e.blockNumber) ?? Date.now(),
          txHash: e.transactionHash,
        });
      }
      onChain.sort((a, b) => b.id - a.id);

      if (onChain.length > 0) {
        setRecentTransfers(onChain);
      }
    } catch (err) {
      console.error("Could not load on-chain history", err);
    }
  }, [account, readContract, readProvider, getDecimals, memos]);

  useEffect(() => {
    if (account) {
      void refreshBalance();
      void loadOnChainHistory();
    } else {
      setBalance("0");
      setRecentTransfers(SEED_TRANSFERS);
    }
  }, [account, refreshBalance, loadOnChainHistory]);

  const sendHmz = useCallback(
    async (
      recipient: string,
      amount: string,
      memo: string,
    ): Promise<boolean> => {
      if (!account) {
        setTxStatus({
          success: false,
          message: "Please connect your wallet first.",
          txHash: "",
        });
        return false;
      }
      if (!isAddress(recipient)) {
        setTxStatus({
          success: false,
          message: "Please provide a valid Ethereum recipient address.",
          txHash: "",
        });
        return false;
      }
      const numericAmount = parseFloat(amount);
      if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
        setTxStatus({
          success: false,
          message: "Please enter a valid amount.",
          txHash: "",
        });
        return false;
      }
      if (!window.ethereum || !walletProvider) {
        setTxStatus({
          success: false,
          message: "MetaMask is not connected.",
          txHash: "",
        });
        return false;
      }

      try {
        setIsTxPending(true);
        setTxStatus({
          success: null,
          message: "Awaiting approval in MetaMask...",
          txHash: "",
        });

        await ensureSepolia();

        // Pre-flight balance check — surfaces a clear message before MetaMask opens.
        try {
          const decimals = await getDecimals(readContract);
          const currentBalance = (await readContract.balanceOf(account)) as bigint;
          const requested = parseUnits(amount, decimals);
          if (currentBalance < requested) {
            setTxStatus({
              success: false,
              message: `Insufficient HMZ. You have ${formatUnits(currentBalance, decimals)} HMZ but tried to send ${amount}.`,
              txHash: "",
            });
            return false;
          }
        } catch {
          // If the pre-flight read fails, fall through and let MetaMask try anyway.
        }

        const localProvider = new BrowserProvider(window.ethereum);
        const signer = await localProvider.getSigner();
        const contract = new Contract(CONTRACT_ADDRESS, HMZ_ABI, signer);
        const decimals = await getDecimals(readContract);
        const parsedAmount = parseUnits(amount, decimals);

        const tx = await contract.transfer(recipient, parsedAmount);

        setTxStatus({
          success: null,
          message: "Transaction pending on-chain. Please wait...",
          txHash: tx.hash,
        });

        await tx.wait();

        setTxStatus({
          success: true,
          message: `Successfully sent ${amount} HMZ!`,
          txHash: tx.hash,
        });

        // Persist the memo so it survives reloads. Saves nothing for blank memos.
        memos.saveMemo(tx.hash, memo);

        setRecentTransfers((prev) => [
          {
            id: Date.now(),
            from: formatAddress(account),
            to: formatAddress(recipient),
            amount,
            recommendation: memo.trim() || "Transfer",
            timestamp: Date.now(),
            txHash: tx.hash,
          },
          ...prev,
        ]);

        void refreshBalance();
        void loadOnChainHistory();
        return true;
      } catch (err) {
        console.error("Transfer error", err);
        setTxStatus({
          success: false,
          message: `Transfer failed: ${friendlyError(err)}`,
          txHash: "",
        });
        return false;
      } finally {
        setIsTxPending(false);
      }
    },
    [
      account,
      walletProvider,
      ensureSepolia,
      getDecimals,
      readContract,
      refreshBalance,
      loadOnChainHistory,
      memos,
    ],
  );

  const appendLocalTransfer = useCallback(
    (entry: {
      from: string;
      to: string;
      amount: string;
      memo: string;
      txHash?: string;
    }) => {
      if (entry.txHash) {
        memos.saveMemo(entry.txHash, entry.memo);
      }
      setRecentTransfers((prev) => [
        {
          id: Date.now(),
          from: formatAddress(entry.from),
          to: formatAddress(entry.to),
          amount: entry.amount,
          recommendation: entry.memo,
          timestamp: Date.now(),
          ...(entry.txHash ? { txHash: entry.txHash } : {}),
        },
        ...prev,
      ]);
    },
    [memos],
  );

  return {
    balance,
    balanceError,
    isLoadingBalance,
    txStatus,
    isTxPending,
    recentTransfers,
    sendHmz,
    refreshBalance,
    appendLocalTransfer,
  };
}

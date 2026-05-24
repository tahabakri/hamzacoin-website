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
  HMZ_ABI,
  SEED_TRANSFERS,
  type Transfer,
} from "../utils/constants";
import { formatAddress } from "../utils/format";

export type TxStatus = {
  success: boolean | null;
  message: string;
  txHash: string;
};

export type TxType = "Tip Friend" | "Cafe Spot" | "Book Rec";

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
    txType: TxType,
  ) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
};

const EMPTY_STATUS: TxStatus = { success: null, message: "", txHash: "" };

const HISTORY_BLOCK_RANGE = 10_000n;

const TYPE_FOR_TX: Record<TxType, Transfer["type"]> = {
  "Tip Friend": "direct",
  "Cafe Spot": "checkin",
  "Book Rec": "book",
};

export function useHmzContract(
  provider: BrowserProvider | null,
  account: string,
  ensureSepolia: () => Promise<void>,
): HmzContractState {
  const [balance, setBalance] = useState("0");
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>(EMPTY_STATUS);
  const [isTxPending, setIsTxPending] = useState(false);
  const [recentTransfers, setRecentTransfers] =
    useState<Transfer[]>(SEED_TRANSFERS);

  const decimalsRef = useRef<bigint | null>(null);

  const getContract = useCallback(async () => {
    if (!provider) return null;
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, HMZ_ABI, signer);
  }, [provider]);

  const getDecimals = useCallback(async (contract: Contract): Promise<bigint> => {
    if (decimalsRef.current !== null) return decimalsRef.current;
    const d = (await contract.decimals()) as bigint;
    decimalsRef.current = d;
    return d;
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!provider || !account) return;
    try {
      setBalanceError(null);
      setIsLoadingBalance(true);
      const contract = await getContract();
      if (!contract) return;
      const decimals = await getDecimals(contract);
      const raw = (await contract.balanceOf(account)) as bigint;
      setBalance(formatUnits(raw, decimals));
    } catch (err) {
      console.error("Error reading balance", err);
      setBalanceError("Could not read balance. Check network and try again.");
    } finally {
      setIsLoadingBalance(false);
    }
  }, [provider, account, getContract, getDecimals]);

  const loadOnChainHistory = useCallback(async () => {
    if (!provider || !account) return;
    try {
      const contract = await getContract();
      if (!contract) return;
      const decimals = await getDecimals(contract);
      const currentBlock = BigInt(await provider.getBlockNumber());
      const fromBlock =
        currentBlock > HISTORY_BLOCK_RANGE
          ? currentBlock - HISTORY_BLOCK_RANGE
          : 0n;

      const [outgoing, incoming] = await Promise.all([
        contract.queryFilter(
          contract.filters.Transfer(account, null),
          fromBlock,
          currentBlock,
        ),
        contract.queryFilter(
          contract.filters.Transfer(null, account),
          fromBlock,
          currentBlock,
        ),
      ]);

      const allEvents = [...outgoing, ...incoming] as EventLog[];

      // Batch-fetch block timestamps
      const uniqueBlocks = Array.from(
        new Set(allEvents.map((e) => e.blockNumber)),
      );
      const blockTimes = new Map<number, number>();
      await Promise.all(
        uniqueBlocks.map(async (bn) => {
          try {
            const block = await provider.getBlock(bn);
            if (block?.timestamp) {
              blockTimes.set(bn, block.timestamp * 1000);
            }
          } catch {
            // skip
          }
        }),
      );

      const onChain: Transfer[] = allEvents
        .filter((e): e is EventLog => "args" in e)
        .map((e) => {
          const from = e.args?.[0] as string;
          const to = e.args?.[1] as string;
          const value = e.args?.[2] as bigint;
          return {
            id: Number(BigInt(e.blockNumber) * 1000n + BigInt(e.index)),
            type: "direct" as const,
            from: formatAddress(from),
            to: formatAddress(to),
            amount: formatUnits(value, decimals),
            recommendation: `Transfer on block ${e.blockNumber}`,
            timestamp: blockTimes.get(e.blockNumber) ?? Date.now(),
          };
        })
        .sort((a, b) => b.id - a.id);

      if (onChain.length > 0) {
        setRecentTransfers(onChain);
      }
    } catch (err) {
      console.error("Could not load on-chain history", err);
    }
  }, [provider, account, getContract, getDecimals]);

  useEffect(() => {
    if (provider && account) {
      void refreshBalance();
      void loadOnChainHistory();
    } else {
      setBalance("0");
      setRecentTransfers(SEED_TRANSFERS);
    }
  }, [provider, account, refreshBalance, loadOnChainHistory]);

  const sendHmz = useCallback(
    async (
      recipient: string,
      amount: string,
      memo: string,
      txType: TxType,
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
      if (!window.ethereum) {
        setTxStatus({
          success: false,
          message: "MetaMask is not installed.",
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

        const localProvider = new BrowserProvider(window.ethereum);
        const signer = await localProvider.getSigner();
        const contract = new Contract(CONTRACT_ADDRESS, HMZ_ABI, signer);
        const decimals = await getDecimals(contract);

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

        const composedMemo = memo
          ? `${txType}: ${memo}`
          : `${txType}: Direct Recommendation Tip`;

        setRecentTransfers((prev) => [
          {
            id: Date.now(),
            type: TYPE_FOR_TX[txType],
            from: formatAddress(account),
            to: formatAddress(recipient),
            amount,
            recommendation: composedMemo,
            timestamp: Date.now(),
          },
          ...prev,
        ]);

        void refreshBalance();
        return true;
      } catch (err) {
        const errMsg =
          (err as { reason?: string; shortMessage?: string; message?: string })
            ?.reason ||
          (err as { shortMessage?: string })?.shortMessage ||
          (err as Error)?.message ||
          "Execution failed. Check gas and balance.";
        setTxStatus({
          success: false,
          message: `Transfer failed: ${errMsg}`,
          txHash: "",
        });
        return false;
      } finally {
        setIsTxPending(false);
      }
    },
    [account, ensureSepolia, getDecimals, refreshBalance],
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
  };
}

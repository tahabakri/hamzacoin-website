import { useCallback, useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { SEPOLIA_CHAIN_ID } from "../utils/constants";
import { ensureSepoliaNetwork } from "../utils/network";

export type WalletState = {
  account: string;
  chainId: string;
  provider: BrowserProvider | null;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  hasMetaMask: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
  ensureSepolia: () => Promise<void>;
};

export function useWallet(): WalletState {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMetaMask, setHasMetaMask] = useState(false);

  useEffect(() => {
    if (!window.ethereum) return;

    setHasMetaMask(true);
    const eth = window.ethereum;
    setProvider(new BrowserProvider(eth));

    void eth
      .request({ method: "eth_chainId" })
      .then((id) => setChainId(id as string))
      .catch(() => {});

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = (args[0] ?? []) as string[];
      setAccount(accounts.length > 0 ? accounts[0] : "");
    };

    const handleChainChanged = (...args: unknown[]) => {
      setChainId(args[0] as string);
    };

    eth.on("accountsChanged", handleAccountsChanged);
    eth.on("chainChanged", handleChainChanged);

    return () => {
      eth.removeListener("accountsChanged", handleAccountsChanged);
      eth.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const ensureSepolia = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }
    await ensureSepoliaNetwork(window.ethereum);
    setChainId(SEPOLIA_CHAIN_ID);
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError(
        "MetaMask is not installed. Please install it to interact with live features.",
      );
      return;
    }

    try {
      setError(null);
      setIsConnecting(true);
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      setAccount(accounts[0]);
      setProvider(new BrowserProvider(window.ethereum));
      await ensureSepolia();
    } catch (err) {
      const reason =
        (err as { reason?: string; message?: string })?.reason ||
        (err as Error)?.message;
      setError(reason || "Connection cancelled or failed. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  }, [ensureSepolia]);

  const disconnect = useCallback(() => {
    setAccount("");
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    account,
    chainId,
    provider,
    isConnecting,
    isCorrectNetwork: chainId === SEPOLIA_CHAIN_ID,
    hasMetaMask,
    error,
    connect,
    disconnect,
    clearError,
    ensureSepolia,
  };
}

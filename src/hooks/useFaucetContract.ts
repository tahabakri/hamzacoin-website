// ============================================================================
// useFaucetContract.ts — wraps the HamzaFaucet claim flow
// ----------------------------------------------------------------------------
// Mirrors the shape of useHmzContract.sendHmz so the UI plumbing for the
// Learn & Earn claim feels identical to the existing send-HMZ flow.
// ============================================================================

import { useCallback, useState } from "react";
import { BrowserProvider, Contract, isHexString } from "ethers";
import { FAUCET_ABI, FAUCET_ADDRESS } from "../utils/constants";
import { friendlyError } from "../utils/errors";

export type FaucetTxStatus = {
  success: boolean | null;
  message: string;
  txHash: string;
};

export type FaucetState = {
  txStatus: FaucetTxStatus;
  isClaimPending: boolean;
  claim: (params: {
    score: number;
    articleHash: string;
    signature: string;
  }) => Promise<{ ok: boolean; txHash?: string }>;
  reset: () => void;
};

const EMPTY: FaucetTxStatus = { success: null, message: "", txHash: "" };

export function useFaucetContract(
  walletProvider: BrowserProvider | null,
  account: string,
  ensureSepolia: () => Promise<void>,
): FaucetState {
  const [txStatus, setTxStatus] = useState<FaucetTxStatus>(EMPTY);
  const [isClaimPending, setIsClaimPending] = useState(false);

  const reset = useCallback(() => setTxStatus(EMPTY), []);

  const claim = useCallback(
    async ({
      score,
      articleHash,
      signature,
    }: {
      score: number;
      articleHash: string;
      signature: string;
    }): Promise<{ ok: boolean; txHash?: string }> => {
      if (!FAUCET_ADDRESS) {
        setTxStatus({
          success: false,
          message:
            "Faucet not configured. Deploy HamzaFaucet and set VITE_FAUCET_ADDRESS, then reload.",
          txHash: "",
        });
        return { ok: false };
      }
      if (!account) {
        setTxStatus({
          success: false,
          message: "Please connect your wallet first.",
          txHash: "",
        });
        return { ok: false };
      }
      if (!Number.isInteger(score) || score < 1 || score > 5) {
        setTxStatus({
          success: false,
          message: "Score must be between 1 and 5.",
          txHash: "",
        });
        return { ok: false };
      }
      if (!isHexString(articleHash, 32)) {
        setTxStatus({
          success: false,
          message: "Article hash is malformed.",
          txHash: "",
        });
        return { ok: false };
      }
      if (!isHexString(signature) || signature.length < 130) {
        setTxStatus({
          success: false,
          message: "Backend signature is missing or malformed.",
          txHash: "",
        });
        return { ok: false };
      }
      if (!window.ethereum || !walletProvider) {
        setTxStatus({
          success: false,
          message: "MetaMask is not connected.",
          txHash: "",
        });
        return { ok: false };
      }

      try {
        setIsClaimPending(true);
        setTxStatus({
          success: null,
          message: "Awaiting approval in MetaMask...",
          txHash: "",
        });

        await ensureSepolia();

        const localProvider = new BrowserProvider(window.ethereum);
        const signer = await localProvider.getSigner();
        const contract = new Contract(FAUCET_ADDRESS, FAUCET_ABI, signer);

        const tx = await contract.claimReward(score, articleHash, signature);

        setTxStatus({
          success: null,
          message: "Claim pending on-chain...",
          txHash: tx.hash,
        });

        await tx.wait();

        setTxStatus({
          success: true,
          message: `Claimed ${score} HMZ!`,
          txHash: tx.hash,
        });
        return { ok: true, txHash: tx.hash };
      } catch (err) {
        console.error("Faucet claim error", err);
        setTxStatus({
          success: false,
          message: `Claim failed: ${friendlyError(err)}`,
          txHash: "",
        });
        return { ok: false };
      } finally {
        setIsClaimPending(false);
      }
    },
    [account, walletProvider, ensureSepolia],
  );

  return { txStatus, isClaimPending, claim, reset };
}

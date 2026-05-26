import { Icon } from "@iconify/react";
import type { FaucetTxStatus } from "../../hooks/useFaucetContract";
import { FAUCET_ADDRESS, SEPOLIA_EXPLORER } from "../../utils/constants";

type Props = {
  score: number;
  account: string;
  isClaimPending: boolean;
  txStatus: FaucetTxStatus;
  onConnect: () => void;
  onClaim: () => void;
  onSkip: () => void;
  onDone: () => void;
};

export function ClaimReward({
  score,
  account,
  isClaimPending,
  txStatus,
  onConnect,
  onClaim,
  onSkip,
  onDone,
}: Props) {
  const claimed = txStatus.success === true;
  const errored = txStatus.success === false;

  if (score === 0) {
    return (
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 text-center space-y-3">
        <Icon
          icon="solar:cup-paper-linear"
          className="text-4xl text-amber-700 mx-auto"
        />
        <p className="text-sm text-amber-900 font-semibold">
          No HMZ this round.
        </p>
        <p className="text-xs text-amber-800">
          Pick another article and try again — the contract still wakes up smiling.
        </p>
        <button
          type="button"
          onClick={onSkip}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-semibold transition-colors"
        >
          Pick another article
        </button>
      </div>
    );
  }

  if (claimed) {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
        <div className="flex justify-center">
          <Icon
            icon="solar:check-circle-bold"
            className="text-5xl text-emerald-600"
          />
        </div>
        <p className="mt-3 text-base font-bold text-emerald-900">
          +{score} HMZ landed in your wallet.
        </p>
        {txStatus.txHash && (
          <div className="mt-2">
            <a
              href={`${SEPOLIA_EXPLORER}/tx/${txStatus.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-800 hover:text-emerald-950 underline underline-offset-2 font-mono"
            >
              <Icon icon="solar:square-arrow-right-up-linear" className="text-sm" />
              View on Etherscan
            </a>
          </div>
        )}
        <div className="mt-5">
          <button
            type="button"
            onClick={onDone}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-coffee-700 to-coffee-800 text-white px-5 py-2.5 text-sm font-semibold shadow-[0_8px_18px_rgba(67,48,36,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-coffee-600 hover:to-coffee-700 transition-all"
          >
            <Icon icon="solar:refresh-linear" className="text-base" />
            Read another article
          </button>
        </div>
      </div>
    );
  }

  if (!FAUCET_ADDRESS) {
    return (
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 space-y-2">
        <p className="text-sm font-semibold text-amber-900">
          Faucet not configured
        </p>
        <p className="text-xs text-amber-800 leading-snug">
          Deploy <code className="font-mono">HamzaFaucet</code> from
          <code className="font-mono"> crypto_class/scripts/deploy-faucet.js</code>, then set
          <code className="font-mono"> VITE_FAUCET_ADDRESS</code> in
          <code className="font-mono"> hamzacoin-react/.env</code> and reload.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-b from-white to-coffee-50 border border-coffee-200 p-5 text-center">
        <p className="text-[10px] font-mono uppercase text-coffee-500 tracking-wider">
          Earnings ready
        </p>
        <p className="text-3xl font-bold text-coffee-950 mt-1 tabular-nums">
          {score} <span className="text-coffee-500 text-lg">HMZ</span>
        </p>
        {!account ? (
          <button
            type="button"
            onClick={onConnect}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-coffee-700 to-coffee-800 text-white px-5 py-2.5 text-sm font-semibold shadow-[0_8px_18px_rgba(67,48,36,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-coffee-600 hover:to-coffee-700 transition-all"
          >
            <Icon icon="solar:wallet-bold" className="text-base" />
            Connect wallet to claim
          </button>
        ) : (
          <button
            type="button"
            onClick={onClaim}
            disabled={isClaimPending}
            aria-busy={isClaimPending}
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              isClaimPending
                ? "bg-coffee-100 text-coffee-500 border border-coffee-200 cursor-not-allowed hmz-pulse-pending"
                : "bg-gradient-to-b from-coffee-700 to-coffee-800 text-white border border-coffee-900 shadow-[0_8px_18px_rgba(67,48,36,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-coffee-600 hover:to-coffee-700"
            }`}
          >
            <Icon icon="solar:hand-money-linear" className="text-base" />
            {isClaimPending ? "Claiming..." : `Claim ${score} HMZ`}
          </button>
        )}
      </div>

      {txStatus.message && (
        <div
          className={`rounded-xl px-4 py-3 text-xs border ${
            errored
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-amber-50 border-amber-200 text-coffee-950"
          }`}
        >
          <div className="flex items-start gap-2">
            <Icon
              icon={errored ? "solar:shield-warning-bold" : "solar:info-circle-bold"}
              className="text-base shrink-0 mt-0.5"
            />
            <div className="flex-1">
              <p className="font-semibold">{txStatus.message}</p>
              {txStatus.txHash && (
                <a
                  href={`${SEPOLIA_EXPLORER}/tx/${txStatus.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block underline font-mono text-[10px]"
                >
                  View on Etherscan
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

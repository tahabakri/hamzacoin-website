import { useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import { SEPOLIA_EXPLORER } from "../utils/constants";
import type { TxStatus, TxType } from "../hooks/useHmzContract";

type Props = {
  account: string;
  isTxPending: boolean;
  txStatus: TxStatus;
  onConnect: () => void;
  onSend: (
    recipient: string,
    amount: string,
    memo: string,
    txType: TxType,
  ) => Promise<boolean>;
};

const TX_TYPES: TxType[] = ["Tip Friend", "Cafe Spot", "Book Rec"];

export function SendForm({
  account,
  isTxPending,
  txStatus,
  onConnect,
  onSend,
}: Props) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [txType, setTxType] = useState<TxType>("Tip Friend");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await onSend(recipient, amount, memo, txType);
    if (success) {
      setRecipient("");
      setAmount("");
      setMemo("");
    }
  };

  return (
    <div className="flex flex-col justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-coffee-50 border border-coffee-100 px-3.5 py-1.5 text-xs text-coffee-700 font-semibold mb-6 shadow-[inset_0_1px_0_white]">
          <Icon
            icon="solar:lock-keyhole-linear"
            className="text-base text-coffee-600"
          />
          Smart Contract Utility
        </div>

        <h3 className="text-3xl font-bold tracking-tight text-coffee-950 leading-[1.1] mb-6">
          Send HMZ with custom memo logs.
        </h3>

        {account ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-coffee-700 uppercase tracking-wider mb-2">
                Recipient Sepolia Address
              </label>
              <input
                type="text"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full bg-white/70 border border-coffee-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-coffee-300 focus:outline-none focus:border-coffee-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-coffee-700 uppercase tracking-wider mb-2">
                  Amount (HMZ)
                </label>
                <input
                  type="number"
                  required
                  min="0.0001"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full bg-white/70 border border-coffee-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-coffee-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-coffee-700 uppercase tracking-wider mb-2">
                  Transaction Type
                </label>
                <select
                  aria-label="Transaction type"
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as TxType)}
                  className="w-full bg-white/70 border border-coffee-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-coffee-500 transition-colors"
                >
                  {TX_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-coffee-700 uppercase tracking-wider mb-2">
                Recommendation Message (Stored Local/Memo)
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="e.g. 'Enjoy a quiet cortado here...'"
                className="w-full bg-white/70 border border-coffee-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-coffee-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isTxPending}
              className="w-full flex items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold text-white bg-gradient-to-b from-coffee-700 to-coffee-800 border border-coffee-900 shadow-[0_10px_24px_rgba(67,48,36,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-coffee-600 hover:to-coffee-700 transition-all duration-300 disabled:opacity-50"
            >
              {isTxPending
                ? "Awaiting Transaction Confirmation..."
                : "Execute HMZ Recommendation Transfer"}
            </button>
          </form>
        ) : (
          <div className="bg-coffee-50 border border-coffee-100 rounded-2xl p-6 text-center space-y-4">
            <p className="text-sm text-coffee-700">
              Connect your Web3 Wallet to interact directly with the Sepolia
              Smart Contract.
            </p>
            <button
              type="button"
              onClick={onConnect}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs text-white bg-gradient-to-b from-coffee-700 to-coffee-800 border border-coffee-900 shadow-[0_5px_12px_rgba(67,48,36,0.15)] font-semibold"
            >
              <Icon icon="solar:wallet-bold" className="text-base" />
              Connect MetaMask
            </button>
          </div>
        )}
      </div>

      {txStatus.message && (
        <div
          className={`mt-6 p-4 rounded-xl border ${
            txStatus.success === false
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-amber-50 border-amber-200 text-coffee-950"
          }`}
        >
          <div className="flex items-start gap-3">
            <Icon
              icon={
                txStatus.success === false
                  ? "solar:shield-warning-bold"
                  : "solar:info-circle-bold"
              }
              className="text-xl mt-0.5"
            />
            <div className="flex-1 text-xs">
              <p className="font-semibold">{txStatus.message}</p>
              {txStatus.txHash && (
                <a
                  href={`${SEPOLIA_EXPLORER}/tx/${txStatus.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline mt-1 block font-mono text-[10px]"
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

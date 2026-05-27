import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import { SEPOLIA_EXPLORER } from "../utils/constants";
import type { TxStatus } from "../hooks/useHmzContract";
import { useRecipientHistory } from "../hooks/useRecipientHistory";
import { formatAddress } from "../utils/format";
import { formatRelative } from "../hooks/useRelativeTime";
import { fireSideCannons } from "../utils/confetti";

type Props = {
  account: string;
  isTxPending: boolean;
  txStatus: TxStatus;
  onConnect: () => void;
  onSend: (
    recipient: string,
    amount: string,
    memo: string,
  ) => Promise<boolean>;
  reduceMotion: boolean;
  onSuccess: () => void;
  onError: () => void;
};

export function SendForm({
  account,
  isTxPending,
  txStatus,
  onConnect,
  onSend,
  reduceMotion,
  onSuccess,
  onError,
}: Props) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [showRecipientList, setShowRecipientList] = useState(false);
  const lastTxRef = useRef<string>("");
  const lastSentRecipientRef = useRef<string>("");
  const recipientWrapperRef = useRef<HTMLDivElement | null>(null);
  const history = useRecipientHistory();

  const filteredEntries = useMemo(() => {
    const q = recipient.trim().toLowerCase();
    if (!q) return history.entries;
    return history.entries.filter((e) =>
      e.address.toLowerCase().includes(q),
    );
  }, [recipient, history.entries]);

  useEffect(() => {
    if (!showRecipientList) return;
    const handlePointer = (e: PointerEvent) => {
      if (
        recipientWrapperRef.current &&
        !recipientWrapperRef.current.contains(e.target as Node)
      ) {
        setShowRecipientList(false);
      }
    };
    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, [showRecipientList]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    lastSentRecipientRef.current = recipient;
    const success = await onSend(recipient, amount, memo);
    if (success) {
      setRecipient("");
      setAmount("");
      setMemo("");
    }
  };

  useEffect(() => {
    if (txStatus.success === true && txStatus.txHash && txStatus.txHash !== lastTxRef.current) {
      lastTxRef.current = txStatus.txHash;
      if (lastSentRecipientRef.current) {
        history.add(lastSentRecipientRef.current);
      }
      onSuccess();
      if (!reduceMotion) {
        fireSideCannons();
      }
    } else if (
      txStatus.success === false &&
      txStatus.message.startsWith("Transfer failed") &&
      txStatus.message !== lastTxRef.current
    ) {
      lastTxRef.current = txStatus.message;
      onError();
    }
  }, [txStatus, reduceMotion, onSuccess, onError, history]);

  return (
    <div className="flex flex-col justify-between">
      <div>
        <h3 className="text-fluid-lg font-bold tracking-tight text-coffee-950 mb-3">
          Send HMZ
        </h3>
        <p className="text-sm text-coffee-600 font-light leading-6 mb-6">
          An ERC20 transfer on Sepolia. The amount goes on-chain, the memo
          stays in your browser.
        </p>

        {account ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div ref={recipientWrapperRef} className="relative">
              <label
                htmlFor="recipient-input"
                className="block text-xs font-semibold text-coffee-700 uppercase tracking-wider mb-2"
              >
                Recipient address
              </label>
              <div className="relative">
                <input
                  id="recipient-input"
                  type="text"
                  required
                  value={recipient}
                  onChange={(e) => {
                    setRecipient(e.target.value);
                    if (history.entries.length > 0) {
                      setShowRecipientList(true);
                    }
                  }}
                  onFocus={() => {
                    if (history.entries.length > 0) {
                      setShowRecipientList(true);
                    }
                  }}
                  placeholder="0x..."
                  inputMode="text"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-describedby="recipient-hint"
                  className="w-full bg-white/70 border border-coffee-200 rounded-xl px-4 py-3 pr-12 text-sm text-stone-900 placeholder-coffee-300 focus:outline-none focus:border-coffee-500 transition-colors font-mono min-w-0"
                />
                <button
                  type="button"
                  onClick={() => setShowRecipientList((v) => !v)}
                  disabled={history.entries.length === 0}
                  aria-label={
                    history.entries.length > 0
                      ? `Show ${history.entries.length} recent recipient${history.entries.length === 1 ? "" : "s"}`
                      : "Recent recipients (none yet)"
                  }
                  title={
                    history.entries.length > 0
                      ? `${history.entries.length} recent recipient${history.entries.length === 1 ? "" : "s"} — click to pick`
                      : "Recent recipients will appear here after a successful send"
                  }
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    history.entries.length > 0
                      ? "text-coffee-700 hover:bg-coffee-50 cursor-pointer"
                      : "text-coffee-300 cursor-not-allowed"
                  }`}
                >
                  <Icon icon="solar:history-linear" className="text-lg" />
                  {history.entries.length > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-coffee-700 text-white text-[9px] font-bold flex items-center justify-center"
                    >
                      {history.entries.length}
                    </span>
                  )}
                </button>
              </div>

              <p
                id="recipient-hint"
                className="mt-1.5 text-[11px] text-coffee-500 font-light"
              >
                {history.entries.length > 0
                  ? `${history.entries.length} saved — click the history icon or focus the field to pick one.`
                  : "Past recipients show up here automatically after a successful send."}
              </p>

              {showRecipientList && history.entries.length > 0 && (
                <div
                  aria-label="Recent recipients"
                  className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-30 rounded-xl bg-white border border-coffee-200 shadow-[0_18px_38px_-12px_rgba(67,48,36,0.25)] overflow-hidden max-h-72 overflow-y-auto"
                >
                  <div className="px-3 py-2 border-b border-coffee-100 flex items-center justify-between">
                    <p className="text-[10px] font-mono uppercase text-coffee-500 tracking-wide">
                      Recent recipients
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        history.clear();
                        setShowRecipientList(false);
                      }}
                      className="text-[10px] text-coffee-500 hover:text-coffee-800 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  {filteredEntries.length > 0 ? (
                    <ul>
                      {filteredEntries.map((entry) => (
                        <li
                          key={entry.address}
                          className="flex items-center hover:bg-coffee-50 transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setRecipient(entry.address);
                              setShowRecipientList(false);
                            }}
                            className="flex-1 min-w-0 px-3 py-2.5 sm:py-2 flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coffee-500 focus-visible:outline-none min-h-[44px] sm:min-h-0"
                          >
                            <div className="w-7 h-7 rounded-lg bg-coffee-50 border border-coffee-100 flex items-center justify-center shrink-0">
                              <Icon
                                icon="solar:user-rounded-linear"
                                className="text-sm text-coffee-700"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-mono text-xs text-coffee-900 truncate"
                                title={entry.address}
                              >
                                {formatAddress(entry.address)}
                              </p>
                              <p className="text-[10px] text-coffee-500 font-light">
                                {formatRelative(entry.lastUsed)}
                              </p>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => history.remove(entry.address)}
                            aria-label={`Remove ${formatAddress(entry.address)} from history`}
                            className="shrink-0 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-coffee-400 hover:text-coffee-800 transition-colors"
                          >
                            <Icon
                              icon="solar:close-circle-linear"
                              className="text-sm"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-center text-xs text-coffee-600">
                      No saved address matches{" "}
                      <span className="font-mono text-coffee-800">
                        {recipient}
                      </span>
                      .
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="amount-input"
                className="block text-xs font-semibold text-coffee-700 uppercase tracking-wider mb-2"
              >
                Amount (HMZ)
              </label>
              <input
                id="amount-input"
                type="number"
                required
                min="0.0001"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                autoComplete="off"
                className="w-full bg-white/70 border border-coffee-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-coffee-500 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="memo-input"
                className="block text-xs font-semibold text-coffee-700 uppercase tracking-wider mb-2"
              >
                Note for yourself
              </label>
              <input
                id="memo-input"
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="e.g. 'Enjoy a quiet cortado here...'"
                inputMode="text"
                maxLength={140}
                aria-describedby="memo-disclaimer"
                className="w-full bg-white/70 border border-coffee-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-coffee-500 transition-colors"
              />
              <p
                id="memo-disclaimer"
                className="mt-2 text-[11px] italic text-coffee-600 leading-relaxed"
              >
                Saved in your browser only, tied to the transaction hash —
                appears in the Recent transfers feed below and survives page
                reloads. The ERC20 standard does not carry text on-chain — only
                sender, recipient, and amount appear on Etherscan.
              </p>
            </div>

            <button
              type="submit"
              disabled={isTxPending}
              className={`w-full flex items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold text-white bg-gradient-to-b from-coffee-700 to-coffee-800 border border-coffee-900 shadow-[0_10px_24px_rgba(67,48,36,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-coffee-600 hover:to-coffee-700 transition-all duration-300 disabled:opacity-90 ${
                isTxPending && !reduceMotion ? "hmz-pulse-pending" : ""
              }`}
            >
              {isTxPending ? "Awaiting confirmation..." : "Send HMZ"}
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
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 sm:py-3 text-xs text-white bg-gradient-to-b from-coffee-700 to-coffee-800 border border-coffee-900 shadow-[0_5px_12px_rgba(67,48,36,0.15)] font-semibold min-h-[44px] sm:min-h-0 w-full sm:w-auto"
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

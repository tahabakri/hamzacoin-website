import { CONTRACT_ADDRESS, type Transfer } from "../utils/constants";
import { RelativeTime } from "./RelativeTime";

type Props = {
  transfers: Transfer[];
  onCopyContract: () => void;
};

export function Stats({ transfers, onCopyContract }: Props) {
  return (
    <div className="rounded-[1.85rem] bg-gradient-to-b from-white to-coffee-100 border border-coffee-200 overflow-hidden shadow-[inset_0_1px_0_white] flex flex-col justify-between">
      <div className="px-5 py-4 border-b border-coffee-200 bg-white/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-stone-900">
              Recent transfers
            </span>
          </div>
          <span className="font-mono text-[10px] text-coffee-400">
            SEPOLIA LIVE
          </span>
        </div>
        <p className="mt-2 text-[11px] italic text-coffee-600 leading-relaxed">
          Memos shown below are local to your browser. On-chain only the
          addresses and amounts are stored.
        </p>
      </div>

      <div className="p-5 flex-1 space-y-3 overflow-y-auto max-h-[340px]">
        {transfers.map((tx) => (
          <div
            key={tx.id}
            className="hmz-row-in rounded-xl bg-white border border-coffee-100 p-4 shadow-[0_2px_8px_rgba(67,48,36,0.02)]"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-coffee-500 min-w-0 break-all">
                <span>From: {tx.from}</span>
                <span aria-hidden="true">→</span>
                <span>To: {tx.to}</span>
              </div>
              <span className="text-xs font-bold text-coffee-800 shrink-0">
                +{tx.amount} HMZ
              </span>
            </div>
            <p className="mt-2 text-xs text-stone-700 italic font-light">
              "{tx.recommendation}"
            </p>
            <p className="mt-1 text-[10px] text-coffee-400 font-mono">
              <RelativeTime timestamp={tx.timestamp} />
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 bg-coffee-50 border-t border-coffee-100 flex items-center justify-between gap-2 text-[11px] text-coffee-600 flex-wrap">
        <span className="break-all">Address: {CONTRACT_ADDRESS.substring(0, 8)}...</span>
        <button
          onClick={onCopyContract}
          className="underline font-semibold hover:text-coffee-950 active:text-coffee-700 min-h-[36px] py-1"
        >
          Copy Contract Address
        </button>
      </div>
    </div>
  );
}

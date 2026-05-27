import { Icon } from "@iconify/react";

type Props = {
  account: string;
  onConnect: () => void;
};

export function FinalCTA({ account, onConnect }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-8 sm:pt-14 pb-12 sm:pb-20">
      <div className="relative isolate overflow-hidden rounded-[2.75rem] bg-gradient-to-b from-coffee-600 via-coffee-700 to-coffee-800 text-white border border-coffee-900 shadow-[0_40px_90px_-45px_rgba(67,48,36,0.6),inset_0_1px_0_rgba(255,255,255,0.25)]">
        <div className="relative z-10 px-6 py-14 sm:py-20 lg:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-3.5 py-2 mb-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_0_5px_rgba(255,255,255,0.14)]"></span>
            <span className="font-mono text-xs font-semibold text-coffee-50 uppercase">
              BUILT TO LEARN, OPEN TO TRY
            </span>
          </div>

          <h2 className="text-fluid-h2 font-normal max-w-5xl mx-auto">
            Learn, earn, send.
            <span className="block italic font-semibold text-amber-200">
              All on-chain.
            </span>
          </h2>

          <p className="mt-6 text-base md:text-lg leading-8 text-coffee-100 font-light max-w-3xl mx-auto">
            Free testnet token. Connect a wallet, run through the loop, read
            the source.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            {account ? (
              <a
                href="#demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 bg-gradient-to-b from-white to-coffee-50 border border-white text-coffee-950 text-sm font-semibold shadow-[0_14px_30px_rgba(67,48,36,0.18)] hover:-translate-y-0.5 transition-all"
              >
                Open Web3 App
                <Icon icon="solar:arrow-right-linear" className="text-lg" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onConnect}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 bg-gradient-to-b from-white to-coffee-50 border border-white text-coffee-950 text-sm font-semibold shadow-[0_14px_30px_rgba(67,48,36,0.18)] hover:-translate-y-0.5 transition-all"
              >
                Connect MetaMask
                <Icon icon="solar:arrow-right-linear" className="text-lg" />
              </button>
            )}
            <a
              href="#about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 bg-white/15 border border-white/25 text-white text-sm font-semibold hover:bg-white/20 hover:-translate-y-0.5 transition-all"
            >
              How it works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

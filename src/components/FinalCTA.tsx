import { Icon } from "@iconify/react";

type Props = {
  account: string;
  onConnect: () => void;
};

export function FinalCTA({ account, onConnect }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-14 pb-20">
      <div className="relative isolate overflow-hidden rounded-[2.75rem] bg-gradient-to-b from-coffee-600 via-coffee-700 to-coffee-800 text-white border border-coffee-900 shadow-[0_40px_90px_-45px_rgba(67,48,36,0.6),inset_0_1px_0_rgba(255,255,255,0.25)]">
        <div className="hidden md:block absolute left-10 top-12 z-20 rotate-[-5deg] animate-final-float-1 pointer-events-none">
          <div className="rounded-2xl bg-white border border-white px-4 py-3 shadow-lg min-w-[12rem] text-stone-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-coffee-50 flex items-center justify-center">
                <Icon
                  icon="solar:cup-hot-linear"
                  className="text-base text-coffee-600"
                />
              </div>
              <div>
                <p className="text-xs font-semibold">Moment complete</p>
                <p className="text-[10px] text-stone-400">Tracked with 5 HMZ</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block absolute right-10 bottom-12 z-20 rotate-[5deg] animate-final-float-2 pointer-events-none">
          <div className="rounded-2xl bg-white border border-white px-4 py-3 shadow-lg min-w-[12rem] text-stone-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <Icon
                  icon="solar:check-circle-linear"
                  className="text-base text-emerald-600"
                />
              </div>
              <div>
                <p className="text-xs font-semibold">Advice Tipped</p>
                <p className="text-[10px] text-stone-400">
                  Solidity transfer successful
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-3.5 py-2 mb-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_0_5px_rgba(255,255,255,0.14)]"></span>
            <span className="font-mono text-xs font-semibold text-coffee-50 uppercase">
              QUIETLY BUILT FOR THE DEEP SCENE
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.05] max-w-5xl mx-auto">
            Take back the value
            <span className="block italic font-semibold text-amber-200">
              of your calm moments.
            </span>
          </h2>

          <p className="mt-6 text-base md:text-lg leading-8 text-coffee-100 font-light max-w-3xl mx-auto">
            HamzaCoin offers a structural framework to capture details without
            algorithms, noise, or advertising layers.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onConnect}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 bg-gradient-to-b from-white to-coffee-50 border border-white text-coffee-950 text-sm font-semibold shadow-[0_14px_30px_rgba(67,48,36,0.18)] hover:-translate-y-0.5 transition-all"
            >
              {account ? "Wallet Connected" : "Connect MetaMask"}
              <Icon icon="solar:arrow-right-linear" className="text-lg" />
            </button>
            <a
              href="#about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 bg-white/15 border border-white/25 text-white text-sm font-semibold hover:bg-white/20 hover:-translate-y-0.5 transition-all"
            >
              Read Purpose
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

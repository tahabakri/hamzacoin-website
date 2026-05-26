import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function DemoSection({ children }: Props) {
  return (
    <section id="demo" className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center max-w-5xl mx-auto mb-14">
        <p className="font-mono text-xs font-semibold tracking-[-0.04em] text-coffee-600 mb-4">
          SEND HMZ
        </p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-coffee-950 leading-[1.05]">
          Send HMZ
          <span className="block font-semibold italic text-coffee-800">
            on Sepolia.
          </span>
        </h2>
        <p className="mt-6 text-base md:text-lg leading-8 text-coffee-700 font-light max-w-3xl mx-auto">
          Connect MetaMask. Send HMZ on Sepolia. The transfer is real
          on-chain — the memo is a local note for your own feed.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[2.75rem] bg-white/55 backdrop-blur-xl border border-white shadow-[0_30px_80px_-45px_rgba(67,48,36,0.3),inset_0_1px_0_rgba(255,255,255,1)] px-6 md:px-10 py-12">
        <div
          className="absolute inset-0 opacity-[0.16] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(67,48,36,0.1) 1px, transparent 0)",
            backgroundSize: "2rem 2rem",
          }}
        ></div>
        <div className="grid lg:grid-cols-2 gap-12 items-stretch relative">
          {children}
        </div>
      </div>
    </section>
  );
}

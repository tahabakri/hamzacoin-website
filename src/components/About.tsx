import { Icon } from "@iconify/react";

const FEATURES = [
  {
    icon: "solar:book-bookmark-linear",
    title: "Read & earn",
    body: "Pick a Wikipedia article, take a 5-question AI quiz, and a signature-gated faucet pays you 1–5 HMZ.",
  },
  {
    icon: "solar:transfer-horizontal-linear",
    title: "Send with memo",
    body: "Transfer HMZ to any Sepolia address with a memo. Every send is a real ERC20 transfer.",
  },
  {
    icon: "solar:graph-up-linear",
    title: "See it live",
    body: "Balances, transfers, and holders are read straight from the chain. The activity feed below is real.",
  },
];

const REAL_ITEMS = [
  "ERC20 contract verified on Sepolia (HamzaCoin)",
  "HamzaFaucet contract with EIP-712 signature verification",
  "Groq-generated quiz on the backend",
  "MetaMask connection and EIP-1193 wallet plumbing",
  "On-chain transfer history read from the chain",
];

const DEMO_ITEMS = [
  "Fluid background shader",
  "3D spinning coin and floating UI accents",
  "Seeded sample transfers shown before a wallet connects",
  "Activity-map animations on the live feed",
];

export function About() {
  return (
    <section id="about" className="max-w-7xl mx-auto px-6 py-12 sm:py-20">
      <div className="flex flex-col z-10 w-full relative gap-y-16">
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-semibold tracking-[-0.04em] text-coffee-600 mb-4">
            WHAT THIS ACTUALLY IS
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-coffee-950 leading-[1.05]">
            A learning project,
            <span className="block text-coffee-800 font-semibold italic">
              in three honest parts.
            </span>
          </h2>
          <p className="mt-5 text-base md:text-lg leading-8 text-coffee-900 font-light max-w-2xl">
            HamzaCoin (HMZ) is an ERC20 token on Sepolia. The site is a working
            demo of three Web3 patterns built end-to-end. Nothing is mocked,
            nothing is aspirational.
          </p>
        </div>

        <div>
          <p className="font-mono text-xs font-semibold tracking-[-0.04em] text-coffee-600 mb-4">
            WHAT IT DOES
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group flex flex-col gap-4 rounded-[2rem] bg-white/60 border border-white p-6 shadow-[0_10px_28px_-20px_rgba(67,48,36,0.12),inset_0_1px_0_white] hover:-translate-y-1 hover:bg-white/80 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-2xl bg-coffee-50 border border-coffee-100 flex items-center justify-center text-coffee-600 shadow-[inset_0_1px_0_white]">
                  <Icon icon={f.icon} className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-coffee-950">
                    {f.title}
                  </h3>
                  <p className="mt-3 leading-7 text-sm font-light text-coffee-700">
                    {f.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[2.75rem] bg-gradient-to-b from-coffee-900 to-coffee-950 text-white border border-coffee-800 relative shadow-[0_40px_90px_-45px_rgba(67,48,36,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div
            className="absolute inset-0 opacity-[0.10]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          ></div>
          <div className="absolute top-[-30%] right-[-10%] w-[32rem] h-[32rem] rounded-full bg-amber-400/10 blur-[6rem]"></div>

          <div className="relative p-8 md:p-12 lg:p-16">
            <p className="font-mono text-xs font-semibold tracking-[-0.04em] text-amber-300 mb-4">
              WHAT&apos;S REAL HERE
            </p>
            <h3 className="text-3xl md:text-4xl lg:text-5xl leading-tight font-light tracking-tight mb-6 max-w-3xl">
              What runs on-chain, and what&apos;s just chrome.
            </h3>
            <p className="text-base leading-8 text-coffee-100 font-light max-w-2xl mb-10">
              The Web3 parts are real. The fancy visuals are decoration. Both
              are listed below so there&apos;s no confusion.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="rounded-[1.75rem] bg-white/5 border border-white/10 p-6 md:p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="text-xl text-emerald-300"
                    />
                  </div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-emerald-300 font-semibold">
                    Real
                  </p>
                </div>
                <ul className="space-y-3">
                  {REAL_ITEMS.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-6 text-coffee-50 font-light"
                    >
                      <Icon
                        icon="solar:check-circle-linear"
                        className="text-base text-emerald-300 shrink-0 mt-0.5"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.75rem] bg-white/5 border border-white/10 p-6 md:p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center">
                    <Icon
                      icon="solar:gallery-linear"
                      className="text-xl text-amber-300"
                    />
                  </div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-amber-300 font-semibold">
                    Display only
                  </p>
                </div>
                <ul className="space-y-3">
                  {DEMO_ITEMS.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-6 text-coffee-200 font-light"
                    >
                      <Icon
                        icon="solar:info-circle-linear"
                        className="text-base text-amber-300 shrink-0 mt-0.5"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10">
              <a
                href="#learn-earn"
                className="inline-flex items-center justify-center gap-3 bg-white hover:bg-coffee-50 transition-all text-coffee-950 text-sm font-semibold rounded-full px-6 py-3 w-fit shadow-[inset_0_1px_0_white] hover:-translate-y-0.5"
              >
                <span>Try Learn &amp; Earn</span>
                <Icon
                  icon="solar:arrow-right-linear"
                  className="text-lg"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

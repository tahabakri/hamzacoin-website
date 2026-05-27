import { Icon } from "@iconify/react";

const CAPABILITIES = [
  {
    icon: "solar:book-bookmark-linear",
    badge: "Earn 1–5 HMZ",
    title: "Learn & Earn",
    body: "Read a Wikipedia article. Answer 5 AI-generated questions. A signature-gated on-chain faucet pays you 1 HMZ per correct answer.",
  },
  {
    icon: "solar:transfer-horizontal-linear",
    badge: "Real ERC20",
    title: "Send with memo",
    body: "Transfer HMZ to any Sepolia address with a custom memo tagged Tip Friend, Cafe Spot, or Book Rec.",
  },
  {
    icon: "solar:shield-check-linear",
    badge: "Verified",
    title: "Live on Sepolia",
    body: "Every transaction is real on Ethereum Sepolia testnet. Verify yours on Etherscan.",
  },
];

export function Capabilities() {
  return (
    <section id="capabilities" className="max-w-7xl mx-auto px-6 py-12 sm:py-20">
      <div className="text-center max-w-5xl mx-auto mb-14">
        <p className="font-mono text-xs font-semibold tracking-[-0.04em] text-coffee-600 mb-4">
          WHAT IT DOES
        </p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-coffee-950 leading-[1.05]">
          Three things this dApp
          <span className="block font-semibold italic text-coffee-800">
            actually does.
          </span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {CAPABILITIES.map((c) => (
          <div
            key={c.title}
            className="rounded-[2rem] bg-white/70 border border-white p-6 shadow-[0_10px_28px_-18px_rgba(67,48,36,0.15),inset_0_1px_0_white] hover:-translate-y-1 hover:bg-white/85 transition-all duration-300"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="w-11 h-11 rounded-2xl bg-coffee-50 border border-coffee-100 flex items-center justify-center">
                <Icon icon={c.icon} className="text-2xl text-coffee-600" />
              </div>
              <span className="font-mono text-[10px] text-coffee-600 bg-coffee-50 border border-coffee-100 rounded-full px-2.5 py-1 font-semibold">
                {c.badge}
              </span>
            </div>
            <h3 className="mt-6 text-xl font-bold tracking-tight text-coffee-950">
              {c.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-stone-500 font-light">
              {c.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

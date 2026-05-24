import { useState } from "react";

type Tier = {
  level: string;
  earn: { amount: string; body: string; perk: string };
  spend: { amount: string; body: string; perk: string };
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    level: "Level 1: Cozy",
    earn: {
      amount: "5",
      body: "Earn by checking in physically at a selected quiet cafe space.",
      perk: "Validated check-in loop",
    },
    spend: {
      amount: "15",
      body: "Spend on an organic cortado at verified partner cafes.",
      perk: "Instant coffee discount",
    },
  },
  {
    level: "Level 2: Deep",
    featured: true,
    earn: {
      amount: "10",
      body: "Earn by publishing verified classic book reviews on-chain.",
      perk: "In-depth literary digest",
    },
    spend: {
      amount: "30",
      body: "Spend on custom aesthetic moment photo minting parameters.",
      perk: "Rare NFT custom output",
    },
  },
  {
    level: "Level 3: Shared",
    earn: {
      amount: "25",
      body: "Earn by organizing quiet listening meetups for friends.",
      perk: "Curator event rewards",
    },
    spend: {
      amount: "100",
      body: "Spend for private club lounge reservation for high-substance conversation.",
      perk: "Curated quiet lounge space",
    },
  },
];

export function Economy() {
  const [isSpendView, setIsSpendView] = useState(false);

  return (
    <section id="economy" className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center max-w-5xl mx-auto mb-14">
        <p className="font-mono text-xs font-semibold tracking-[-0.04em] text-coffee-600 mb-4">
          MOMENT ECONOMY
        </p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-coffee-950 leading-[1.05]">
          Quiet rates and
          <span className="block font-semibold italic text-coffee-800">
            subtle exchanges.
          </span>
        </h2>
        <p className="mt-6 text-base md:text-lg leading-8 text-coffee-700 font-light max-w-3xl mx-auto">
          Earn tokens by engaging in quiet daily rituals, then spend them
          locally or on-chain for curated sensory experiences. Toggle below to
          review standard parameters.
        </p>
      </div>

      <div className="mb-12 flex justify-center">
        <label className="relative flex items-center p-1 bg-[#e2e8f0] rounded-full cursor-pointer w-full max-w-[16rem] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_1px_1px_rgba(255,255,255,1)] border border-slate-300">
          <input
            type="checkbox"
            checked={isSpendView}
            onChange={() => setIsSpendView((v) => !v)}
            className="sr-only"
          />
          <div
            className={`absolute left-1 top-1 bottom-1 w-[calc(50%-0.25rem)] bg-gradient-to-b from-white to-coffee-100 rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)] border border-coffee-200 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isSpendView ? "translate-x-full" : ""
            }`}
          ></div>
          <span
            className={`relative w-1/2 text-center text-xs font-semibold py-2.5 z-10 transition-colors duration-300 ${
              !isSpendView ? "text-coffee-950" : "text-stone-400"
            }`}
          >
            Ritual Earn Rates
          </span>
          <span
            className={`relative w-1/2 text-center text-xs font-semibold py-2.5 z-10 transition-colors duration-300 ${
              isSpendView ? "text-coffee-950" : "text-stone-400"
            }`}
          >
            Experiential Spend
          </span>
        </label>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch justify-center gap-8 w-full max-w-5xl mx-auto">
        {TIERS.map((tier) => {
          const view = isSpendView ? tier.spend : tier.earn;
          const isFeatured = tier.featured;
          return (
            <div
              key={tier.level}
              className={`relative w-full lg:w-1/3 rounded-[2rem] border border-coffee-200 p-8 transition-all ${
                isFeatured
                  ? "bg-gradient-to-b from-coffee-100/50 to-white shadow-[0_15px_35px_-10px_rgba(67,48,36,0.15),inset_0_2px_0_white] hover:shadow-[0_25px_50px_-12px_rgba(67,48,36,0.2)]"
                  : "bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06),inset_0_2px_0_white] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]"
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-b from-coffee-600 to-coffee-700 text-white text-[0.65rem] font-medium rounded-full border border-coffee-800">
                  Recommended Loop
                </div>
              )}
              <div
                className={`h-full flex flex-col justify-between ${
                  isFeatured ? "pt-2" : ""
                }`}
              >
                <div>
                  <h3
                    className={`text-xs font-semibold uppercase tracking-widest mb-4 ${
                      isFeatured ? "text-coffee-600" : "text-coffee-400"
                    }`}
                  >
                    {tier.level}
                  </h3>
                  <div className="flex items-baseline text-coffee-950">
                    <span className="text-5xl font-bold tracking-tight">
                      {view.amount}
                    </span>
                    <span className="text-xs font-light text-stone-400 ml-1">
                      HMZ
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-light text-stone-500 leading-relaxed">
                    {view.body}
                  </p>
                </div>
                <div
                  className={`mt-8 pt-6 border-t flex items-center justify-between ${
                    isFeatured ? "border-coffee-200" : "border-coffee-100"
                  }`}
                >
                  <span className="text-xs font-semibold text-coffee-700">
                    {view.perk}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

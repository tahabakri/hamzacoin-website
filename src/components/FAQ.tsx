import { Icon } from "@iconify/react";

const FAQS = [
  {
    icon: "solar:hand-money-linear",
    question: "How do I earn HMZ?",
    answer:
      "Connect your wallet and head to Learn & Earn. Pick a Wikipedia article, finish a 5-question quiz. The backend signs your score, and a smart contract on Sepolia pays out 1 HMZ per correct answer.",
  },
  {
    icon: "solar:shield-warning-linear",
    question: "Is this real money?",
    answer:
      "No. HMZ runs on Sepolia, Ethereum's test network. Tokens are free to claim and worthless outside this demo. Sepolia ETH for gas is also free from faucets.",
  },
  {
    icon: "solar:lock-keyhole-linear",
    question: "Why does it need a backend?",
    answer:
      "To prevent users from faking their quiz score. The backend grades your answers in private, then signs an EIP-712 message that the contract verifies on-chain before paying out.",
  },
  {
    icon: "solar:smartphone-linear",
    question: "Can I use this on my phone?",
    answer:
      "Yes — open the site inside the MetaMask app's built-in browser. A banner will guide you if you're in regular Safari or Chrome.",
  },
  {
    icon: "solar:code-square-linear",
    question: "Is the code open source?",
    answer:
      "Yes. Contracts, backend, and frontend are all on GitHub. See the links in the footer.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <p className="font-mono text-xs font-semibold tracking-[-0.04em] text-coffee-600 mb-4">
          FAQ
        </p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-coffee-950">
          Plain questions.
          <span className="block font-semibold italic text-coffee-800">
            Honest answers.
          </span>
        </h2>
      </div>

      <div className="relative overflow-hidden rounded-[2.75rem] bg-white/60 backdrop-blur-xl border border-white shadow-[0_30px_80px_-45px_rgba(67,48,36,0.25),inset_0_1px_0_white] p-4 md:p-6 lg:p-8">
        <div className="relative grid lg:grid-cols-[0.82fr_1.18fr] gap-6 lg:gap-8 items-start">
          <div className="rounded-[2.25rem] bg-gradient-to-b from-coffee-800 to-coffee-950 text-white p-6 md:p-8 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.10]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
                backgroundSize: "34px 34px",
              }}
            ></div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-8">
              <Icon
                icon="solar:question-circle-linear"
                className="text-2xl text-amber-200"
              />
            </div>
            <p className="font-mono text-xs font-semibold tracking-wide text-amber-200 mb-4">
              STILL CURIOUS?
            </p>
            <h3 className="text-3xl font-light leading-tight">
              Open source. Free to test.
            </h3>
            <p className="mt-5 text-sm text-coffee-100 font-light leading-relaxed">
              HamzaCoin is a learning project on Ethereum&apos;s Sepolia test
              network. The token has no monetary value. The code for the
              contracts, the backend, and this site is on GitHub.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.question}
                className="group rounded-[2rem] bg-white/75 border border-coffee-200/80 overflow-hidden open:bg-white/90 transition-all"
              >
                <summary className="cursor-pointer list-none px-5 md:px-6 py-5 flex items-center justify-between gap-5 focus:outline-none">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-2xl bg-coffee-50 border border-coffee-100 flex items-center justify-center">
                      <Icon icon={f.icon} className="text-xl text-coffee-600" />
                    </div>
                    <h3 className="text-base font-semibold text-coffee-950">
                      {f.question}
                    </h3>
                  </div>
                  <Icon
                    icon="solar:add-circle-linear"
                    className="text-xl text-stone-500 group-open:rotate-45 transition-transform"
                  />
                </summary>
                <div className="px-5 md:px-6 pb-6 md:pl-[5.75rem]">
                  <p className="text-sm leading-relaxed text-stone-600 font-light">
                    {f.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

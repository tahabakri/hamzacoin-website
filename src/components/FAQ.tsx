import { Icon } from "@iconify/react";

const FAQS = [
  {
    icon: "solar:chat-round-like-linear",
    question: "How do I earn HamzaCoin (HMZ)?",
    answer:
      "Currently, you can gain testnet HMZ via direct faucet provisions, recommendations shared using the on-chain transfer logs, or through community ritual verifications.",
  },
  {
    icon: "solar:shield-check-linear",
    question: "Is my physical coordinate private?",
    answer:
      "Yes. Geolocation coordinate verification is compiled and hashed client-side before submission, preventing active physical location data tracking.",
  },
  {
    icon: "solar:global-linear",
    question: "Which network is HamzaCoin deployed on?",
    answer:
      "HamzaCoin is live on the Sepolia Ethereum test network at address 0x619F30ec004442cdc3BE060FC927A3688054e6c3. It is completely free to verify and test.",
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
          Cozy queries.
          <span className="block font-semibold italic text-coffee-800">
            Clear answers.
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
              Start quietly. Stay connected.
            </h3>
            <p className="mt-5 text-sm text-coffee-100 font-light leading-relaxed">
              HamzaCoin requires zero active engagement metrics. You hold the
              token, share recommendations directly via standard transfer
              inputs, and log quiet moments on Sepolia testnet.
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

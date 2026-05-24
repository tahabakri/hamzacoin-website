import { Icon } from "@iconify/react";

const CAPABILITIES = [
  {
    icon: "solar:cup-hot-linear",
    badge: "Earn 5 HMZ",
    title: "Café Check-ins",
    body: "Check in locally at handpicked coffee establishments. Validated dynamically by coordinate verification.",
  },
  {
    icon: "solar:music-note-linear",
    badge: "Earn 2 HMZ",
    title: "Acoustic Shares",
    body: "Share quiet albums or vinyl links. Connect with people over refined soundscapes.",
  },
  {
    icon: "solar:book-bookmark-linear",
    badge: "Earn 3 HMZ",
    title: "Book Outlines",
    body: "Summarize key paragraphs or quotes. Share raw literature advice and receive tokens quietly.",
  },
  {
    icon: "solar:gallery-linear",
    badge: "Earn 10 HMZ",
    title: "Quiet Moment NFTs",
    body: "Mint scenic moments without filters. Real photos representing deep peace and isolation.",
  },
  {
    icon: "solar:dialog-linear",
    badge: "Tip Friendly",
    title: "Direct Recommendations",
    body: "Tip friends for high-quality advice or custom café tips using standard on-chain routes.",
  },
];

export function Capabilities() {
  return (
    <section id="capabilities" className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center max-w-5xl mx-auto mb-14">
        <p className="font-mono text-xs font-semibold tracking-[-0.04em] text-coffee-600 mb-4">
          HOW TO PARTICIPATE
        </p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-coffee-950 leading-[1.05]">
          Five actions designed for
          <span className="block font-semibold italic text-coffee-800">
            refined life sharing.
          </span>
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        <div className="md:col-span-2 lg:col-span-3 rounded-[2.25rem] bg-gradient-to-b from-coffee-800 to-coffee-950 text-white p-6 md:p-8 relative overflow-hidden shadow-[0_28px_70px_-35px_rgba(67,48,36,0.6),inset_0_1px_0_rgba(255,255,255,0.13)]">
          <div className="absolute top-[-40%] right-[-10%] w-[24rem] h-[24rem] rounded-full bg-amber-400/10 blur-[5rem]"></div>
          <div
            className="absolute inset-0 opacity-[0.09]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          ></div>

          <div className="relative grid lg:grid-cols-[0.85fr_1.15fr] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span className="font-mono text-[10px] tracking-wide text-amber-200 font-semibold">
                  REFLECT ON ACTION
                </span>
              </div>
              <h3 className="text-3xl md:text-4xl font-normal text-white">
                Refined Moment Wrap
              </h3>
              <p className="mt-4 text-sm md:text-base leading-7 text-coffee-100 font-light">
                Review the recommendations you shared throughout the week.
                Export your on-chain log directly into a private markdown
                journal.
              </p>
            </div>

            <div className="rounded-[1.75rem] bg-white text-stone-900 p-4 border border-white/80 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.62),inset_0_1px_0_white]">
              <div className="flex items-center justify-between border-b border-coffee-100 pb-4 mb-4">
                <div>
                  <p className="text-xs text-stone-400 font-light">
                    Quiet Week Summary
                  </p>
                  <p className="mt-1 text-xl font-bold text-coffee-950">
                    Refined & Tracked
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-coffee-50 border border-coffee-100 flex items-center justify-center">
                  <Icon
                    icon="solar:moon-stars-linear"
                    className="text-xl text-coffee-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-coffee-50 border border-coffee-100 p-4 text-center">
                  <p className="font-mono text-[10px] text-coffee-500 font-semibold">
                    CHECK-INS
                  </p>
                  <p className="mt-2 text-2xl font-bold text-coffee-950">4</p>
                </div>
                <div className="rounded-2xl bg-amber-50/50 border border-amber-100 p-4 text-center">
                  <p className="font-mono text-[10px] text-amber-600 font-semibold">
                    EARNED
                  </p>
                  <p className="mt-2 text-2xl font-bold text-coffee-950">28</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-b from-coffee-600 to-coffee-800 text-white p-4 text-center">
                  <p className="font-mono text-[10px] text-amber-300 font-semibold">
                    TIPS SENT
                  </p>
                  <p className="mt-2 text-2xl font-bold">12</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

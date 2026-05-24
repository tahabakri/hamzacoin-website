import { Icon } from "@iconify/react";

const PROBLEMS = [
  {
    icon: "solar:cloud-snow-linear",
    title: "Overwhelming Noise",
    body: "Traditional tokens chase viral loops. HamzaCoin targets deliberate silence.",
  },
  {
    icon: "solar:stars-minimalistic-linear",
    title: "Unrefined Rewards",
    body: "Earn value for sharing things you actually spent hours enjoying.",
  },
  {
    icon: "solar:bookmark-opened-linear",
    title: "Fleeting Reads",
    body: "Stop scrolling, start summarizing. Share structured wisdom instead.",
  },
  {
    icon: "solar:bell-linear",
    title: "Zero Calm",
    body: "HamzaCoin operates inside cozy, selected parameters of lifestyle value.",
  },
];

export function About() {
  return (
    <section id="about" className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex flex-col z-10 w-full relative gap-y-16">
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-semibold tracking-[-0.04em] text-coffee-600 mb-4">
            WHY IT MATTERS
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-coffee-950 leading-[1.05]">
            Our social platforms leave us
            <span className="block text-coffee-800 font-semibold italic">
              conceptually empty.
            </span>
          </h2>
          <p className="mt-5 text-base md:text-lg leading-8 text-coffee-900 font-light max-w-2xl">
            Quiet moments, books read, isolated cafes, and deep songs aren't
            meant for algorithmic clicks. AURA-inspired minimalism means
            rewarding the signals that carry calm, real-world substance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {PROBLEMS.map((p) => (
            <div
              key={p.title}
              className="group flex flex-col gap-4 rounded-[2rem] bg-white/60 border border-white p-6 shadow-[0_10px_28px_-20px_rgba(67,48,36,0.12),inset_0_1px_0_white] hover:-translate-y-1 hover:bg-white/80 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-2xl bg-coffee-50 border border-coffee-100 flex items-center justify-center text-coffee-600 shadow-[inset_0_1px_0_white]">
                <Icon icon={p.icon} className="text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-coffee-950">
                  {p.title}
                </h3>
                <p className="mt-3 leading-7 text-sm font-light text-coffee-700">
                  {p.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden min-h-[560px] lg:min-h-[620px] rounded-[2.75rem] bg-gradient-to-b from-coffee-900 to-coffee-950 text-white border border-coffee-800 relative shadow-[0_40px_90px_-45px_rgba(67,48,36,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div
            className="absolute inset-0 opacity-[0.10]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          ></div>
          <div className="absolute top-[-30%] right-[-10%] w-[32rem] h-[32rem] rounded-full bg-amber-400/10 blur-[6rem]"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] min-h-[560px] lg:min-h-[620px] h-full">
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
              <p className="font-mono text-xs font-semibold tracking-[-0.04em] text-amber-300 mb-4">
                THE CONCEPTUAL SHIFT
              </p>
              <h2 className="md:text-4xl lg:text-5xl leading-tight text-3xl font-light text-white tracking-tight mb-6">
                From metric-seeking feeds to structured slow exchange.
              </h2>
              <p className="text-base leading-8 text-coffee-100 font-light max-w-xl">
                HamzaCoin acts as a protocol layer for deliberate connection.
                Every transaction logs a structured advice tip, cafe name, or
                peaceful soundscape.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <a
                  href="#demo"
                  className="group flex items-center justify-center gap-3 bg-white hover:bg-coffee-50 transition-all text-coffee-950 text-sm font-semibold rounded-full px-6 py-3 w-fit shadow-[inset_0_1px_0_white] hover:-translate-y-0.5"
                >
                  <span>Send a Rec</span>
                  <Icon
                    icon="solar:arrow-right-linear"
                    className="text-lg group-hover:translate-x-1 transition-transform"
                  />
                </a>
              </div>
            </div>

            <div className="relative flex items-center justify-center p-6 md:p-10 lg:pr-14">
              <div className="relative w-full max-w-2xl rounded-[2.25rem] bg-white/[0.055] border border-white/10 p-4 md:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_30px_70px_-40px_rgba(0,0,0,0.72)] backdrop-blur-sm">
                <div className="rounded-[1.85rem] bg-gradient-to-b from-white to-coffee-100 text-stone-900 border border-white/80 overflow-hidden shadow-[0_18px_50px_-30px_rgba(0,0,0,0.55),inset_0_1px_0_white]">
                  <div className="px-5 py-4 flex items-center justify-between border-b border-coffee-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-coffee-300"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-coffee-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-coffee-700"></span>
                    </div>
                    <span className="font-mono text-xs text-coffee-500">
                      MOMENT FLOW
                    </span>
                  </div>

                  <div className="p-5 md:p-6">
                    <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-5 items-stretch">
                      <div className="rounded-[1.5rem] bg-coffee-50 border border-coffee-200 p-4 shadow-[inset_0_1px_0_white]">
                        <p className="font-mono text-[10px] text-coffee-400 uppercase tracking-widest mb-4">
                          MESSY LIFE
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 rounded-2xl bg-white border border-coffee-200 px-3 py-3 shadow-[0_2px_8px_rgba(67,48,36,0.03)]">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                              <Icon
                                icon="solar:cup-hot-linear"
                                className="text-base text-amber-600"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-stone-900">
                                Quiet Cafes
                              </p>
                              <p className="text-[10px] text-stone-400">
                                Isolated offline moments
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 rounded-2xl bg-white border border-coffee-200 px-3 py-3 shadow-[0_2px_8px_rgba(67,48,36,0.03)]">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                              <Icon
                                icon="solar:music-note-linear"
                                className="text-base text-amber-600"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-stone-900">
                                Deep Songs
                              </p>
                              <p className="text-[10px] text-stone-400">
                                Acoustic layers
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-coffee-700 flex items-center justify-center text-white">
                          <Icon icon="solar:arrow-right-linear" className="text-lg" />
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] bg-gradient-to-b from-coffee-800 to-coffee-900 text-white p-4">
                        <p className="font-mono text-[10px] text-amber-300 uppercase tracking-widest mb-4">
                          ACTIONABLE VALUE
                        </p>
                        <div className="space-y-3">
                          <div className="rounded-2xl bg-white/10 border border-white/10 px-3 py-2">
                            <p className="text-xs font-semibold">
                              Decisions Minted
                            </p>
                            <p className="text-[10px] text-coffee-200">
                              Earned 5 HMZ on Sepolia
                            </p>
                          </div>
                          <div className="rounded-2xl bg-white/10 border border-white/10 px-3 py-2">
                            <p className="text-xs font-semibold">
                              Tipped to Friend
                            </p>
                            <p className="text-[10px] text-coffee-200">
                              Log entry: "The secret album"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

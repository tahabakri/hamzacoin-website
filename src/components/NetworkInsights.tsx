import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useTransferHistory } from "../hooks/useTransferHistory";
import { Leaderboard } from "./Leaderboard";
import { HISTORY_WINDOW_LABEL, HISTORY_BLOCK_LABEL } from "../utils/constants";

const DailyVolumeChart = lazy(() => import("./DailyVolumeChart"));
const PersonalChart = lazy(() => import("./PersonalChart"));

type Props = {
  account: string;
  reduceMotion: boolean;
};

const ChartSkeleton = () => (
  <div className="rounded-[1.85rem] bg-white/60 border border-coffee-200 p-5 h-64 flex items-center justify-center text-xs text-coffee-500 font-light">
    <Icon
      icon="solar:loading-linear"
      className="text-xl text-coffee-400 mr-2 animate-spin"
    />
    Loading chart…
  </div>
);

export function NetworkInsights({ account, reduceMotion }: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const history = useTransferHistory();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  const animate = !reduceMotion;

  return (
    <section
      ref={sectionRef}
      id="insights"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20"
      aria-label="Network insights"
    >
      <div className="text-center max-w-3xl mx-auto mb-10">
        <p className="font-mono text-xs font-semibold tracking-[-0.04em] text-coffee-600 mb-4">
          NETWORK INSIGHTS
        </p>
        <h2 className="text-fluid-h2 font-normal tracking-tight text-coffee-950">
          On-chain patterns,
          <span className="block font-semibold italic text-coffee-800">
            quietly observed.
          </span>
        </h2>
        <p className="mt-5 text-base leading-7 text-coffee-700 font-light">
          Aggregated from the {HISTORY_WINDOW_LABEL} of Sepolia{" "}
          ({HISTORY_BLOCK_LABEL}).
          {history.isLoading && " Loading from chain…"}
        </p>
      </div>

      {history.error && (
        <div className="max-w-3xl mx-auto mb-8 rounded-xl bg-red-50 border border-red-200 text-red-900 px-4 py-3 text-xs">
          <span className="font-semibold">Could not load history:</span>{" "}
          {history.error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          {inView ? (
            <Suspense fallback={<ChartSkeleton />}>
              <DailyVolumeChart
                data={history.dailyVolume}
                animate={animate}
                isLoading={history.isLoading}
              />
            </Suspense>
          ) : (
            <ChartSkeleton />
          )}
        </div>

        {account && (
          <div className="lg:col-span-2">
            {inView ? (
              <Suspense fallback={<ChartSkeleton />}>
                <PersonalChart
                  events={history.events}
                  decimals={history.decimals}
                  account={account}
                  animate={animate}
                />
              </Suspense>
            ) : (
              <ChartSkeleton />
            )}
          </div>
        )}

        <Leaderboard
          entries={history.leaderboard}
          isLoading={history.isLoading}
        />

        <div className="rounded-[clamp(1rem,3vw,1.85rem)] bg-gradient-to-b from-coffee-800 to-coffee-950 text-white p-4 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.13)]">
          <p className="font-mono text-[10px] tracking-widest text-amber-200 font-semibold">
            HOLDER COUNT
          </p>
          <p className="mt-2 text-[clamp(2.5rem,10vw,4rem)] font-bold tabular-nums leading-none">
            {history.holderCount}
          </p>
          <p className="mt-2 text-xs text-coffee-100 font-light leading-5">
            Unique addresses with positive HMZ balance, derived from the last{" "}
            {HISTORY_BLOCK_LABEL} of Transfer events. An undercount if older
            holders haven't moved tokens since.
          </p>
        </div>
      </div>
    </section>
  );
}

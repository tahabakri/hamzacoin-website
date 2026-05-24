import { formatUnits } from "ethers";
import { Icon } from "@iconify/react";
import { formatAddress } from "../utils/format";
import { AnimatedNumber } from "./AnimatedNumber";
import { CoffeeSteam } from "./CoffeeSteam";
import { SpinningCoin } from "./SpinningCoin";

type Props = {
  account: string;
  balance: string;
  isLoadingBalance: boolean;
  balanceError: string | null;
  totalSupply: bigint | null;
  totalSupplyDecimals: bigint | null;
  holderCount: number;
  reduceMotion: boolean;
};

export function Hero({
  account,
  balance,
  isLoadingBalance,
  balanceError,
  totalSupply,
  totalSupplyDecimals,
  holderCount,
  reduceMotion,
}: Props) {
  const numericBalance = Number(balance);
  const showBalanceSkeleton = Boolean(account) && isLoadingBalance;
  const totalSupplyNumber =
    totalSupply && totalSupplyDecimals
      ? Number(formatUnits(totalSupply, totalSupplyDecimals))
      : 50000;
  return (
    <section className="max-w-7xl mx-auto px-6 pt-32 md:pt-40 pb-20">
      <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-12 lg:gap-16 items-center">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/75 border border-white px-3.5 py-2 shadow-[0_6px_18px_-12px_rgba(67,48,36,0.2),inset_0_1px_0_white] mb-8">
            <span className="w-7 h-7 rounded-full bg-gradient-to-b from-amber-50 to-white border border-amber-100 shadow-[inset_0_1px_0_white] flex items-center justify-center animate-pulse">
              <Icon icon="solar:stars-linear" className="text-base text-amber-600" />
            </span>
            <span className="font-mono text-xs font-medium tracking-[-0.04em] text-coffee-600">
              PREMIUM UTILITY ERC20
            </span>
          </div>

          <h1
            className="text-[3.5rem] md:text-[5rem] lg:text-[6rem] font-light tracking-[-0.075em] leading-[0.92] text-coffee-950"
            style={{ textShadow: "0 1px 1px rgba(255,255,255,0.8)" }}
          >
            <span className="block whitespace-nowrap">Share beauty.</span>
            <span className="block whitespace-nowrap mt-2">Earn quietly.</span>
            <span className="inline-flex whitespace-nowrap mt-4 rounded-[1.35rem] bg-gradient-to-b from-coffee-600 to-coffee-800 border border-coffee-900 px-4 md:px-5 pb-2.5 pt-1.5 text-white font-normal shadow-[0_18px_38px_-20px_rgba(86,62,47,0.55),inset_0_1px_0_rgba(255,255,255,0.2)]">
              Hold moments.
            </span>
          </h1>

          <p className="mt-8 text-base md:text-lg leading-8 text-coffee-800 font-light max-w-2xl mx-auto lg:mx-0">
            HamzaCoin is "The Quiet Recommendation Token" — built for people who
            prefer beautiful moments, deep cafes, books, and music over chaotic
            feeds and algorithm-driven likes.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 bg-gradient-to-b from-coffee-700 to-coffee-800 border border-coffee-900 text-white text-sm font-semibold shadow-[0_10px_24px_rgba(67,48,36,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-coffee-600 hover:to-coffee-700 hover:-translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.18)] transition-all duration-300"
            >
              Open Web3 Portal
              <Icon icon="solar:arrow-right-linear" className="text-lg" />
            </a>
            <a
              href="#capabilities"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 bg-gradient-to-b from-white to-coffee-50 border border-coffee-200 text-coffee-800 text-sm font-semibold shadow-[0_4px_12px_rgba(67,48,36,0.05),inset_0_1px_0_white] hover:from-coffee-50 hover:to-coffee-100 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Icon
                icon="solar:play-circle-linear"
                className="text-lg text-coffee-600"
              />
              How to Earn
            </a>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-coffee-600 font-light">
            <span className="inline-flex items-center gap-2">
              <Icon
                icon="solar:shield-check-linear"
                className="text-base text-coffee-600"
              />
              Sepolia Testnet Active
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-coffee-300"></span>
            <span className="inline-flex items-center gap-2">
              <Icon
                icon="solar:database-linear"
                className="text-base text-coffee-600"
              />
              Etherscan Verified
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-coffee-300"></span>
            <span className="inline-flex items-center gap-2">
              <Icon
                icon="solar:cup-hot-linear"
                className="text-base text-coffee-600"
              />
              Built for focused creators
            </span>
          </div>
        </div>

        <div className="relative lg:pl-4">
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-amber-200/30 via-white/20 to-orange-200/20 blur-3xl"></div>

          <div className="absolute -top-12 -left-4 md:-left-10 z-30 w-20 h-20 md:w-[120px] md:h-[120px]">
            <SpinningCoin reduceMotion={reduceMotion} size={120} />
          </div>

          <div className="relative rounded-[2rem] bg-coffee-50/50 border border-white shadow-[0_30px_80px_-35px_rgba(67,48,36,0.22),inset_0_2px_0_rgba(255,255,255,1)] p-4 sm:p-5">
            <div className="hidden md:block absolute inset-0 z-20 pointer-events-none">
              <div className="hmz-float-bubble absolute -right-7 top-10 rounded-2xl bg-white/90 backdrop-blur border border-white px-4 py-3 shadow-[0_18px_38px_-20px_rgba(67,48,36,0.2),inset_0_1px_0_white] min-w-[12rem]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Icon
                      icon="solar:map-point-linear"
                      className="text-lg text-emerald-600"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-stone-900 font-medium">
                      Coffee verified
                    </p>
                    <p className="text-[10px] text-stone-400 font-light">
                      +5 HMZ Earned
                    </p>
                  </div>
                </div>
              </div>

              <div className="hmz-float-bubble absolute -right-7 top-[35%] rounded-2xl bg-white/90 backdrop-blur border border-white px-4 py-3 shadow-[0_18px_38px_-20px_rgba(67,48,36,0.2),inset_0_1px_0_white] min-w-[12rem]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                    <Icon
                      icon="solar:headphones-round-linear"
                      className="text-lg text-amber-600"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-stone-900 font-medium">
                      Jazz Shared
                    </p>
                    <p className="text-[10px] text-stone-400 font-light">
                      Emailed recommendations
                    </p>
                  </div>
                </div>
              </div>

              <div className="hmz-float-bubble absolute -right-7 bottom-[26%] rounded-2xl bg-white/90 backdrop-blur border border-white px-4 py-3 shadow-[0_18px_38px_-20px_rgba(67,48,36,0.2),inset_0_1px_0_white] min-w-[12rem]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-coffee-100 flex items-center justify-center">
                    <Icon
                      icon="solar:notebook-linear"
                      className="text-lg text-coffee-600"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-stone-900 font-medium">
                      Outlines Minted
                    </p>
                    <p className="text-[10px] text-stone-400 font-light">
                      Book club reward (+3 HMZ)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-b from-white to-coffee-100/50 border border-coffee-200 shadow-[inset_0_1px_0_white] overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-coffee-200/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-coffee-600"></span>
                </div>
                <div className="font-mono text-[10px] text-coffee-400 tracking-wide font-semibold">
                  TOKEN OVERVIEW
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs text-coffee-500 font-light mb-1">
                      Total Quiet Supply
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-coffee-950 tabular-nums">
                      <AnimatedNumber
                        value={totalSupplyNumber}
                        decimals={0}
                        suffix=" HMZ"
                        enabled={!reduceMotion}
                      />
                    </h2>
                    {holderCount > 0 && (
                      <p className="mt-1 text-[10px] text-coffee-500 font-mono">
                        <AnimatedNumber
                          value={holderCount}
                          enabled={!reduceMotion}
                        />{" "}
                        holders · last 7 days
                      </p>
                    )}
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-coffee-50 border border-coffee-100 flex items-center justify-center text-coffee-700 shadow-[inset_0_1px_0_white]">
                    <Icon icon="solar:stars-linear" className="text-2xl" />
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="hmz-hero-card rounded-2xl bg-white border border-coffee-100 p-4 shadow-[0_2px_8px_rgba(67,48,36,0.03),inset_0_1px_0_white]">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Icon
                          icon="solar:wallet-linear"
                          className="text-lg text-amber-600"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-stone-800">
                            Your Wallet
                          </p>
                          <span className="text-[10px] text-coffee-600 bg-coffee-50 border border-coffee-100 rounded-full px-2 py-0.5">
                            Sepolia
                          </span>
                        </div>
                        <p className="text-xs leading-5 text-stone-500 mt-1 font-light">
                          {account
                            ? `Connected Address: ${formatAddress(account)}`
                            : "Connect to inspect balance & logs"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="hmz-hero-card rounded-2xl bg-white border border-coffee-100 p-4 shadow-[0_2px_8px_rgba(67,48,36,0.03),inset_0_1px_0_white]">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                        <Icon
                          icon="solar:cup-hot-linear"
                          className="text-lg text-orange-600"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-semibold text-stone-800">
                              Quiet Recommendations
                            </p>
                            <CoffeeSteam
                              reduceMotion={reduceMotion}
                              className="text-orange-500 w-4 h-5"
                            />
                          </div>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 font-medium">
                            Active
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-stone-500 font-light space-y-1">
                          <div>☕ Café Visits: Earn 5 HMZ</div>
                          <div>🎵 Music Shared: Earn 2 HMZ</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="hmz-hero-card relative overflow-hidden rounded-2xl bg-gradient-to-b from-coffee-50 to-coffee-200/50 text-coffee-950 border border-coffee-200 p-4 shadow-[0_12px_28px_-16px_rgba(67,48,36,0.14),inset_0_1px_0_white]">
                      <div className="relative flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-coffee-600 shadow-[0_0_0_4px_rgba(108,79,59,0.12)]"></span>
                            <p className="text-[10px] text-coffee-500 font-light">
                              Your Balance
                            </p>
                          </div>
                          <p className="mt-2 text-xl font-bold tracking-tight text-coffee-950 tabular-nums">
                            {showBalanceSkeleton ? (
                              <span aria-label="Loading balance">…</span>
                            ) : (
                              <AnimatedNumber
                                value={numericBalance}
                                decimals={2}
                                suffix=" HMZ"
                                enabled={!reduceMotion}
                              />
                            )}
                          </p>
                          {balanceError && (
                            <p className="mt-1 text-[10px] text-red-700 font-medium">
                              {balanceError}
                            </p>
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-white/80 border border-white flex items-center justify-center shadow-[inset_0_1px_0_white]">
                          <Icon
                            icon="solar:safe-2-linear"
                            className="text-base text-coffee-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="hmz-hero-card rounded-2xl bg-gradient-to-b from-coffee-700 to-coffee-800 text-white border border-coffee-900 p-4 shadow-[0_10px_24px_-14px_rgba(67,48,36,0.55),inset_0_1px_0_rgba(255,255,255,0.2)]">
                      <p className="text-[10px] text-coffee-200 font-light">
                        Contract Status
                      </p>
                      <p className="mt-1 text-xs leading-5 font-light text-coffee-100">
                        Verified Sepolia Deploy. Mint closed.
                      </p>
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

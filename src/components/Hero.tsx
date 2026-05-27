import { formatUnits } from "ethers";
import { Icon } from "@iconify/react";
import { formatAddress } from "../utils/format";
import { AnimatedNumber } from "./AnimatedNumber";
import { SpinningCoin } from "./SpinningCoin";
import { useFaucetBalance, formatFaucetHmz } from "../hooks/useFaucetBalance";

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
  const faucet = useFaucetBalance();
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-32 lg:pt-40 pb-12 sm:pb-20 overflow-hidden">
      <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-10 sm:gap-12 lg:gap-16 items-center min-w-0">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/75 border border-white px-3.5 py-2 shadow-[0_6px_18px_-12px_rgba(67,48,36,0.2),inset_0_1px_0_white] mb-6 sm:mb-8">
            <span className="w-7 h-7 rounded-full bg-gradient-to-b from-amber-50 to-white border border-amber-100 shadow-[inset_0_1px_0_white] flex items-center justify-center animate-pulse">
              <Icon icon="solar:stars-linear" className="text-base text-amber-600" />
            </span>
            <span className="font-mono text-xs font-medium tracking-[-0.04em] text-coffee-600">
              LEARN-TO-EARN · SEPOLIA
            </span>
          </div>

          <h1
            className="text-fluid-display font-light tracking-[-0.075em] text-coffee-950"
            style={{ textShadow: "0 1px 1px rgba(255,255,255,0.8)" }}
          >
            <span className="block">Read articles.</span>
            <span className="block mt-1.5 sm:mt-2">Take quizzes.</span>
            <span className="inline-flex mt-3 sm:mt-4 rounded-[clamp(0.875rem,1.5vw,1.35rem)] bg-gradient-to-b from-coffee-600 to-coffee-800 border border-coffee-900 px-[clamp(0.75rem,1.5vw,1.25rem)] pb-[clamp(0.4rem,0.6vw,0.625rem)] pt-[clamp(0.15rem,0.4vw,0.375rem)] text-white font-normal shadow-[0_18px_38px_-20px_rgba(86,62,47,0.55),inset_0_1px_0_rgba(255,255,255,0.2)] max-w-full">
              Earn HMZ.
            </span>
          </h1>

          <p className="mt-6 sm:mt-8 text-base md:text-lg leading-7 sm:leading-8 text-coffee-800 font-light max-w-2xl mx-auto lg:mx-0">
            A learn-to-earn ERC20 on Sepolia. Read a Wikipedia article, answer
            five questions, and a smart contract pays you 1–5 HMZ. Then send it
            anywhere with a memo.
          </p>

          <div className="mt-7 sm:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <a
              href="#learn-earn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 bg-gradient-to-b from-coffee-700 to-coffee-800 border border-coffee-900 text-white text-sm font-semibold shadow-[0_10px_24px_rgba(67,48,36,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-coffee-600 hover:to-coffee-700 hover:-translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.18)] transition-all duration-300"
            >
              Learn & Earn
              <Icon icon="solar:arrow-right-linear" className="text-lg" />
            </a>
            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 bg-gradient-to-b from-white to-coffee-50 border border-coffee-200 text-coffee-800 text-sm font-semibold shadow-[0_4px_12px_rgba(67,48,36,0.05),inset_0_1px_0_white] hover:from-coffee-50 hover:to-coffee-100 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Icon
                icon="solar:transfer-horizontal-linear"
                className="text-lg text-coffee-600"
              />
              Send HMZ
            </a>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-coffee-600 font-light">
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
            <a
              href="https://github.com/tahabakri/hamzacoin-website"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-coffee-950 transition-colors"
            >
              <Icon
                icon="solar:code-square-linear"
                className="text-base text-coffee-600"
              />
              Open source
            </a>
          </div>
        </div>

        {/* Side panel (Stats card + 3D coin + decorative floating bubbles) —
            hidden on mobile / tablet because the same balance / supply / wallet
            data is already accessible elsewhere on the page (FAQ, Stats list,
            Hero CTA buttons) and on small screens this card just creates a
            tall translucent gap that pushes the hero text out of the fold. */}
        <div className="relative lg:pl-4 min-w-0 hidden lg:block">
          <div className="absolute -inset-4 sm:-inset-8 rounded-[3rem] bg-gradient-to-br from-amber-200/30 via-white/20 to-orange-200/20 blur-3xl pointer-events-none"></div>

          <div className="absolute -top-8 left-2 sm:-top-12 sm:-left-4 md:-left-10 z-30 w-[clamp(3.75rem,7vw,7.5rem)] h-[clamp(3.75rem,7vw,7.5rem)] overflow-hidden">
            <SpinningCoin reduceMotion={reduceMotion} size={120} />
          </div>

          <div className="relative rounded-[2rem] bg-coffee-50/50 border border-white shadow-[0_30px_80px_-35px_rgba(67,48,36,0.22),inset_0_2px_0_rgba(255,255,255,1)] p-4 sm:p-5">
            <div className="hidden md:block absolute inset-0 z-20 pointer-events-none">
              <div className="hmz-float-bubble absolute -right-7 top-10 rounded-2xl bg-white/90 backdrop-blur border border-white px-4 py-3 shadow-[0_18px_38px_-20px_rgba(67,48,36,0.2),inset_0_1px_0_white] min-w-[12rem]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Icon
                      icon="solar:shield-check-linear"
                      className="text-lg text-emerald-600"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-stone-900 font-medium">
                      Live on Sepolia
                    </p>
                    <p className="text-[10px] text-stone-400 font-light">
                      Chain ID 11155111
                    </p>
                  </div>
                </div>
              </div>

              <div className="hmz-float-bubble absolute -right-7 top-[35%] rounded-2xl bg-white/90 backdrop-blur border border-white px-4 py-3 shadow-[0_18px_38px_-20px_rgba(67,48,36,0.2),inset_0_1px_0_white] min-w-[13rem]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                    <Icon
                      icon="solar:hand-money-linear"
                      className="text-lg text-amber-600"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-stone-900 font-medium">
                      Learn & Earn faucet
                    </p>
                    <p className="text-[10px] text-stone-400 font-light">
                      {faucet.isConfigured
                        ? faucet.balance !== null
                          ? `${formatFaucetHmz(faucet.balance)} HMZ available`
                          : "Reading balance…"
                        : "Not configured yet"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="hmz-float-bubble absolute -right-7 bottom-[26%] rounded-2xl bg-white/90 backdrop-blur border border-white px-4 py-3 shadow-[0_18px_38px_-20px_rgba(67,48,36,0.2),inset_0_1px_0_white] min-w-[12rem]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-coffee-100 flex items-center justify-center">
                    <Icon
                      icon="solar:wallet-linear"
                      className="text-lg text-coffee-600"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-stone-900 font-medium">
                      {account ? "Wallet connected" : "Wallet ready"}
                    </p>
                    <p className="text-[10px] text-stone-400 font-light font-mono">
                      {account ? formatAddress(account) : "Connect to claim"}
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
                      Total HMZ supply
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
                        holders on chain
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
                          icon="solar:book-bookmark-linear"
                          className="text-lg text-orange-600"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-stone-800">
                            Learn & Earn
                          </p>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 font-medium">
                            Active
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-stone-500 font-light space-y-1">
                          <div>📚 Wikipedia article + 5-question AI quiz</div>
                          <div>🪙 Up to 5 HMZ per article, signed on-chain</div>
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

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { formatAddress } from "../utils/format";
import type { SettingsState } from "../hooks/useSettings";
import { BlockCounter } from "./BlockCounter";
import { SettingsMenu } from "./SettingsMenu";

type Props = {
  account: string;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  settings: SettingsState;
};

export function Header({
  account,
  isConnecting,
  isCorrectNetwork,
  onConnect,
  onDisconnect,
  settings,
}: Props) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const showNetworkWarn = account && !isCorrectNetwork;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 pt-5">
        <div className="relative rounded-full bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_14px_38px_-22px_rgba(67,48,36,0.3),inset_0_1px_0_rgba(255,255,255,1)] px-4 py-3">
          <div className="absolute inset-0 rounded-full bg-white/40 pointer-events-none"></div>
          <div className="relative z-10 flex items-center justify-between">
            <a href="#" className="flex items-center gap-3 group">
              <span className="w-9 h-9 rounded-full bg-gradient-to-b from-white to-coffee-100 border border-coffee-200 shadow-[0_2px_8px_rgba(67,48,36,0.06),inset_0_1px_0_white] flex items-center justify-center">
                <span className="font-mono text-xs font-semibold tracking-[-0.08em] text-coffee-700">
                  HM
                </span>
              </span>
              <span className="flex flex-col justify-center leading-none">
                <span className="font-mono text-sm font-bold tracking-[-0.08em] text-coffee-950 group-hover:text-coffee-700 transition-colors">
                  HAMZACOIN
                </span>
                <span className="mt-0.5 text-[10px] font-light tracking-[-0.03em] text-coffee-500">
                  Quiet Recommendations
                </span>
              </span>
            </a>

            <div className="hidden md:flex items-center gap-7 text-xs text-coffee-700 font-medium">
              <a
                href="#about"
                className="relative transition-colors duration-300 hover:text-coffee-950 after:absolute after:left-0 after:-bottom-1.5 after:h-px after:w-0 after:bg-coffee-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                Purpose
              </a>
              <a
                href="#capabilities"
                className="relative transition-colors duration-300 hover:text-coffee-950 after:absolute after:left-0 after:-bottom-1.5 after:h-px after:w-0 after:bg-coffee-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                Earn Loop
              </a>
              <a
                href="#demo"
                className="relative transition-colors duration-300 hover:text-coffee-950 after:absolute after:left-0 after:-bottom-1.5 after:h-px after:w-0 after:bg-coffee-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                Live Web3 App
              </a>
              <a
                href="#technical"
                className="relative transition-colors duration-300 hover:text-coffee-950 after:absolute after:left-0 after:-bottom-1.5 after:h-px after:w-0 after:bg-coffee-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                Contract
              </a>
              <a
                href="#faq"
                className="relative transition-colors duration-300 hover:text-coffee-950 after:absolute after:left-0 after:-bottom-1.5 after:h-px after:w-0 after:bg-coffee-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                FAQ
              </a>
            </div>

            <div className="flex items-center gap-2">
              <BlockCounter reduceMotion={settings.reduceMotion} />
              <SettingsMenu settings={settings} />
              {account ? (
                <div className="relative" ref={popoverRef}>
                  <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className={`flex items-center gap-2 bg-coffee-100/80 hover:bg-coffee-100 border border-coffee-200 rounded-full px-3.5 py-1.5 shadow-[inset_0_1px_0_white] transition-colors ${
                      !showNetworkWarn && !settings.reduceMotion
                        ? "hmz-pulse-connected"
                        : ""
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        showNetworkWarn
                          ? "bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.2)]"
                          : "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.18)]"
                      }`}
                    ></span>
                    <span className="font-mono text-xs font-semibold text-coffee-900">
                      {formatAddress(account)}
                    </span>
                    <Icon
                      icon="solar:alt-arrow-down-linear"
                      className={`text-sm text-coffee-700 transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {open && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-coffee-200 shadow-[0_18px_38px_-12px_rgba(67,48,36,0.25)] overflow-hidden">
                      <div className="px-4 py-3 border-b border-coffee-100">
                        <p className="text-[10px] font-mono uppercase text-coffee-500 tracking-wide">
                          Connected
                        </p>
                        <p className="mt-1 font-mono text-xs font-semibold text-coffee-900 break-all">
                          {account}
                        </p>
                        <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              showNetworkWarn
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          ></span>
                          <span
                            className={
                              showNetworkWarn
                                ? "text-amber-700 font-semibold"
                                : "text-emerald-700 font-semibold"
                            }
                          >
                            {showNetworkWarn ? "Wrong network" : "Sepolia"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onDisconnect();
                          setOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-xs text-coffee-800 hover:bg-coffee-50 transition-colors"
                      >
                        <Icon
                          icon="solar:logout-2-linear"
                          className="text-base text-coffee-600"
                        />
                        Disconnect Wallet
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onConnect}
                  disabled={isConnecting}
                  className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs text-white bg-gradient-to-b from-coffee-700 to-coffee-800 border border-coffee-900 shadow-[0_5px_14px_rgba(67,48,36,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] hover:from-coffee-600 hover:to-coffee-700 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

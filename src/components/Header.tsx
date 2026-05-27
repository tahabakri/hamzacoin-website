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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: PointerEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, [open]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const handlePointer = (e: PointerEvent) => {
      if (
        mobileNavRef.current &&
        !mobileNavRef.current.contains(e.target as Node)
      ) {
        setMobileNavOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, [mobileNavOpen]);

  // Auto-close mobile nav when the route hash changes (user tapped a link).
  useEffect(() => {
    const handleHash = () => setMobileNavOpen(false);
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const showNetworkWarn = account && !isCorrectNetwork;

  const NAV_LINKS: { href: string; label: string }[] = [
    { href: "#about", label: "How it works" },
    { href: "#capabilities", label: "Features" },
    { href: "#learn-earn", label: "Learn & Earn" },
    { href: "#demo", label: "Send HMZ" },
    { href: "#technical", label: "Contract" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5">
        <div className="relative rounded-full bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_14px_38px_-22px_rgba(67,48,36,0.3),inset_0_1px_0_rgba(255,255,255,1)] px-3 sm:px-4 py-2 sm:py-3">
          <div className="absolute inset-0 rounded-full bg-white/40 pointer-events-none"></div>
          <div className="relative z-10 flex items-center justify-between gap-2 min-w-0">
            <a href="#" className="flex items-center gap-2 sm:gap-3 group min-w-0 shrink">
              <span className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-b from-white to-coffee-100 border border-coffee-200 shadow-[0_2px_8px_rgba(67,48,36,0.06),inset_0_1px_0_white] flex items-center justify-center">
                <span className="font-mono text-xs font-semibold tracking-[-0.08em] text-coffee-700">
                  HM
                </span>
              </span>
              {/* Brand name is hidden on the tightest phones; logo alone still
                  identifies the site. From sm: up we show the full block. */}
              <span className="hidden xs:flex sm:flex flex-col justify-center leading-none min-w-0">
                <span className="font-mono text-sm font-bold tracking-[-0.08em] text-coffee-950 group-hover:text-coffee-700 transition-colors truncate">
                  HAMZACOIN
                </span>
                <span className="hidden sm:block mt-0.5 text-[10px] font-light tracking-[-0.03em] text-coffee-500 truncate">
                  Learn-to-earn ERC20
                </span>
              </span>
            </a>

            <div className="hidden md:flex items-center gap-5 lg:gap-7 text-xs text-coffee-700 font-medium">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative transition-colors duration-300 hover:text-coffee-950 after:absolute after:left-0 after:-bottom-1.5 after:h-px after:w-0 after:bg-coffee-600 after:transition-all after:duration-300 hover:after:w-full"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Mobile-only hamburger — opens a dropdown sheet with NAV_LINKS */}
              <div className="md:hidden relative" ref={mobileNavRef}>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen((v) => !v)}
                  aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
                  aria-expanded={mobileNavOpen}
                  aria-controls="mobile-nav-panel"
                  className="w-10 h-10 rounded-full bg-coffee-50 hover:bg-coffee-100 active:scale-95 border border-coffee-200 shadow-[inset_0_1px_0_white] flex items-center justify-center text-coffee-700 transition-all"
                >
                  <Icon
                    icon={mobileNavOpen ? "solar:close-circle-linear" : "solar:hamburger-menu-linear"}
                    className="text-xl"
                  />
                </button>
                {mobileNavOpen && (
                  <div
                    id="mobile-nav-panel"
                    role="menu"
                    aria-label="Site sections"
                    /* Fixed-position so the panel anchors to the viewport's
                       right edge instead of the hamburger button's right edge.
                       Avoids the left-clipping bug when the hamburger sits
                       in the middle of the header row on narrow screens. */
                    className="fixed top-[3.75rem] sm:top-[4.5rem] right-3 sm:right-6 w-[min(15rem,calc(100vw-1.5rem))] rounded-2xl bg-white border border-coffee-200 shadow-[0_18px_38px_-12px_rgba(67,48,36,0.25)] overflow-hidden z-[60]"
                  >
                    <div className="px-4 py-2 border-b border-coffee-100">
                      <p className="text-[10px] font-mono uppercase text-coffee-500 tracking-wide">
                        Jump to
                      </p>
                    </div>
                    <ul>
                      {NAV_LINKS.map((link) => (
                        <li key={link.href}>
                          <a
                            href={link.href}
                            role="menuitem"
                            onClick={() => setMobileNavOpen(false)}
                            className="block px-4 py-3 text-sm text-coffee-800 hover:bg-coffee-50 active:bg-coffee-100 transition-colors min-h-[44px] flex items-center"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <BlockCounter reduceMotion={settings.reduceMotion} />
              <SettingsMenu settings={settings} />
              {account ? (
                <div className="relative" ref={popoverRef}>
                  <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-label={`Wallet ${formatAddress(account)} — open menu`}
                    aria-haspopup="menu"
                    className={`flex items-center gap-2 bg-coffee-100/80 hover:bg-coffee-100 active:scale-95 border border-coffee-200 rounded-full px-3.5 py-2 shadow-[inset_0_1px_0_white] transition-all ${
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
                    <div className="fixed top-[3.75rem] sm:top-[4.5rem] sm:absolute sm:top-full sm:mt-2 right-3 sm:right-0 w-[min(16rem,calc(100vw-1.5rem))] rounded-2xl bg-white border border-coffee-200 shadow-[0_18px_38px_-12px_rgba(67,48,36,0.25)] overflow-hidden z-[60]">
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
                  aria-label={isConnecting ? "Connecting wallet" : "Connect wallet"}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 sm:px-4 py-2 text-xs text-white bg-gradient-to-b from-coffee-700 to-coffee-800 border border-coffee-900 shadow-[0_5px_14px_rgba(67,48,36,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] hover:from-coffee-600 hover:to-coffee-700 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0 shrink-0"
                >
                  <Icon icon="solar:wallet-bold" className="text-sm sm:hidden" />
                  <span className="hidden sm:inline">
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                  </span>
                  <span className="sm:hidden">
                    {isConnecting ? "..." : "Connect"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

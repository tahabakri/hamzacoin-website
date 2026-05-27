import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import {
  buildMetaMaskDeepLink,
  isInMetaMaskBrowser,
  isMobileUA,
} from "../utils/device";

const STORAGE_KEY = "hmz-mobile-banner-dismissed-v1";

type Props = {
  account: string;
};

export function MobileWalletBanner({ account }: Props) {
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [shouldShow, setShouldShow] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // localStorage disabled — fall through
    }
    setShouldShow(isMobileUA() && !isInMetaMaskBrowser());
  }, []);

  if (!shouldShow || dismissed || account) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  /**
   * Open the dApp inside MetaMask. The strategy:
   *   1. Try the official universal link via direct same-tab navigation
   *      (`window.location.href = ...`). This is the format that works on
   *      modern iOS Safari and Android Chrome when MetaMask is installed.
   *   2. If MetaMask is NOT installed, metamask.app.link's own redirect
   *      logic sends the browser to the App Store / Play Store.
   *
   * We deliberately do NOT use target="_blank". Many Android browsers
   * (Brave, Samsung Internet, in-app webviews, MIUI Browser) treat
   * target=_blank as a popup and either block it outright or open it in
   * a context where the universal-link OS hand-off doesn't fire. Direct
   * same-tab navigation is the most reliable across the matrix.
   */
  const handleOpenInMetaMask = () => {
    const link = buildMetaMaskDeepLink();
    try {
      window.location.href = link;
    } catch {
      // very unusual — provide a fallback by setting window.location instead
      try {
        window.location.assign(link);
      } catch {
        // give up silently — the visible URL is still available below
      }
    }
  };

  const handleCopyUrl = () => {
    const dappUrl =
      typeof window !== "undefined" ? window.location.href : "";
    void (async () => {
      try {
        await navigator.clipboard.writeText(dappUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } catch {
        setCopied(false);
      }
    })();
  };

  const currentPageUrl =
    typeof window !== "undefined" ? window.location.href : "";

  return (
    <div
      role="status"
      aria-live="polite"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24 md:mt-28"
    >
      <div className="rounded-2xl bg-gradient-to-b from-amber-50 to-white border border-amber-200 shadow-[0_18px_38px_-22px_rgba(180,83,9,0.25),inset_0_1px_0_white] p-4 flex items-start gap-3">
        <span
          className="shrink-0 w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-base"
          aria-hidden="true"
        >
          📱
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-coffee-950">
            On mobile? Open this in the MetaMask app for full Web3 access.
          </p>
          <p className="mt-1 text-xs text-coffee-700 font-light leading-5">
            Your browser does not have a wallet extension. Tap below to
            relaunch this page inside MetaMask Mobile, where transactions can
            be signed.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleOpenInMetaMask}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 bg-gradient-to-b from-coffee-700 to-coffee-800 border border-coffee-900 text-white text-xs font-semibold shadow-[0_5px_14px_rgba(67,48,36,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-95 transition-transform min-h-[44px]"
              aria-label="Open this dApp inside the MetaMask mobile app"
            >
              <Icon icon="solar:cardholder-linear" className="text-base" />
              Open in MetaMask
            </button>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 bg-white border border-coffee-300 text-coffee-800 text-xs font-semibold active:bg-coffee-50 transition-colors min-h-[44px]"
              aria-label="Copy this page URL to clipboard"
            >
              <Icon
                icon={copied ? "solar:check-circle-bold" : "solar:copy-linear"}
                className={`text-base ${copied ? "text-emerald-600" : ""}`}
              />
              {copied ? "Copied" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex items-center gap-1 rounded-full px-4 py-2.5 bg-transparent text-coffee-600 text-xs font-semibold hover:bg-coffee-50 transition-colors min-h-[44px]"
            >
              Dismiss
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="mt-3 text-[11px] text-coffee-600 hover:text-coffee-900 underline-offset-2 hover:underline inline-flex items-center gap-1"
            aria-expanded={showAdvanced}
          >
            <Icon
              icon={
                showAdvanced
                  ? "solar:alt-arrow-up-linear"
                  : "solar:alt-arrow-down-linear"
              }
              className="text-xs"
            />
            {showAdvanced ? "Hide" : "Button didn't open MetaMask?"}
          </button>

          {showAdvanced && (
            <div className="mt-2 rounded-xl bg-white/70 border border-amber-100 p-3 text-[11px] text-coffee-800 font-light leading-5 space-y-2">
              <p>
                If tapping the button did nothing, MetaMask isn&apos;t
                installed on this device. Two options:
              </p>
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>
                  Install MetaMask, then come back here.{" "}
                  <a
                    href="https://metamask.io/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-coffee-900 underline underline-offset-2"
                  >
                    Download MetaMask
                  </a>
                </li>
                <li>
                  Or open MetaMask Mobile, tap the browser tab, and paste
                  this URL:
                </li>
              </ol>
              <div className="flex items-stretch gap-2">
                <code className="flex-1 min-w-0 break-all rounded-lg bg-coffee-50 border border-coffee-200 px-2 py-1.5 font-mono text-[10px] text-coffee-900">
                  {currentPageUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="shrink-0 inline-flex items-center justify-center rounded-lg bg-coffee-800 hover:bg-coffee-900 text-white px-2.5 text-[10px] font-semibold min-h-[34px]"
                  aria-label="Copy URL"
                >
                  {copied ? "✓" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

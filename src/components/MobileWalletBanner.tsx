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
            Your browser does not have a wallet extension. Tap below to relaunch
            this page inside MetaMask Mobile, where transactions can be signed.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={buildMetaMaskDeepLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                // Some Android browsers (Brave, Samsung Internet, in-app
                // webviews) ignore universal links on a plain <a> click but
                // honour them via window.location.assign. Trying both gives
                // us the widest chance of the OS hand-off firing.
                try {
                  const link = buildMetaMaskDeepLink();
                  // Small timeout so the default <a> handler runs first; if
                  // it didn't navigate, the assign() will. If it did, the
                  // assign() is a no-op on the now-backgrounded page.
                  window.setTimeout(() => {
                    try {
                      window.location.assign(link);
                    } catch {
                      // ignore — universal link failures are silent by design
                    }
                  }, 250);
                } catch {
                  // never block the default <a> behavior
                }
                // Let the default link behavior continue.
                void e;
              }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 bg-gradient-to-b from-coffee-700 to-coffee-800 border border-coffee-900 text-white text-xs font-semibold shadow-[0_5px_14px_rgba(67,48,36,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-95 transition-transform min-h-[44px]"
              aria-label="Open this dApp inside the MetaMask mobile app"
            >
              <Icon icon="solar:cardholder-linear" className="text-base" />
              Open in MetaMask
            </a>
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex items-center gap-1 rounded-full px-4 py-2.5 bg-white border border-coffee-200 text-coffee-700 text-xs font-semibold active:bg-coffee-50 transition-colors min-h-[44px]"
            >
              Dismiss
            </button>
          </div>
          <p className="mt-2 text-[10px] text-coffee-500 font-light">
            No MetaMask installed yet? The link will redirect to the app
            store.
          </p>
        </div>
      </div>
    </div>
  );
}

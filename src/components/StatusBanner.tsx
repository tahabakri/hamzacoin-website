import { Icon } from "@iconify/react";

type Props = {
  error: string | null;
  showNetworkWarning: boolean;
  onDismissError: () => void;
  onSwitchNetwork: () => void;
};

export function StatusBanner({
  error,
  showNetworkWarning,
  onDismissError,
  onSwitchNetwork,
}: Props) {
  if (!error && !showNetworkWarning) return null;

  // "MetaMask is not installed" is a soft state, not a real error — style it
  // as an info card (amber, not red) with a primary CTA to install.
  const isMetaMaskMissing =
    !!error && /metamask is not installed/i.test(error);

  return (
    <div className="fixed top-20 sm:top-24 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none">
      <div className="max-w-7xl mx-auto space-y-2">
        {error && isMetaMaskMissing && (
          <div className="pointer-events-auto rounded-2xl bg-gradient-to-b from-amber-50 to-white border border-amber-200 text-coffee-950 px-4 py-3 shadow-[0_18px_38px_-22px_rgba(180,83,9,0.25),inset_0_1px_0_white] backdrop-blur">
            <div className="flex items-start gap-3">
              <Icon
                icon="solar:cardholder-linear"
                className="text-xl mt-0.5 shrink-0 text-amber-700"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-5">
                  Wallet not detected
                </p>
                <p className="mt-1 text-xs font-light leading-5 text-coffee-700">
                  Install MetaMask to connect. On mobile, the link opens the
                  MetaMask app or the app store.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href="https://metamask.io/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 bg-gradient-to-b from-coffee-700 to-coffee-800 border border-coffee-900 text-white text-xs font-semibold shadow-[0_5px_14px_rgba(67,48,36,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-95 transition-transform min-h-[40px]"
                  >
                    <Icon icon="solar:download-linear" className="text-base" />
                    Get MetaMask
                  </a>
                  <button
                    type="button"
                    onClick={onDismissError}
                    className="inline-flex items-center gap-1 rounded-full px-4 py-2.5 bg-white border border-coffee-200 text-coffee-700 text-xs font-semibold active:bg-coffee-50 transition-colors min-h-[40px]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={onDismissError}
                aria-label="Dismiss"
                className="shrink-0 text-coffee-500 hover:text-coffee-900 transition-colors -mr-1 -mt-1"
              >
                <Icon icon="solar:close-circle-linear" className="text-xl" />
              </button>
            </div>
          </div>
        )}
        {error && !isMetaMaskMissing && (
          <div className="pointer-events-auto flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 text-red-900 px-4 py-3 shadow-[0_10px_28px_-18px_rgba(150,30,30,0.4)] backdrop-blur">
            <Icon
              icon="solar:shield-warning-bold"
              className="text-xl mt-0.5 shrink-0"
            />
            <p className="flex-1 text-xs font-semibold leading-5">{error}</p>
            <button
              type="button"
              onClick={onDismissError}
              aria-label="Dismiss error"
              className="shrink-0 text-red-700 hover:text-red-900 transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
            >
              <Icon icon="solar:close-circle-linear" className="text-xl" />
            </button>
          </div>
        )}
        {showNetworkWarning && (
          <div className="pointer-events-auto flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 text-coffee-950 px-4 py-3 shadow-[0_10px_28px_-18px_rgba(180,120,40,0.4)] backdrop-blur">
            <Icon
              icon="solar:danger-triangle-bold"
              className="text-xl mt-0.5 shrink-0 text-amber-600"
            />
            <div className="flex-1 text-xs leading-5">
              <p className="font-semibold">Wrong network</p>
              <p className="font-light text-coffee-800">
                Switch to Sepolia to interact with the HMZ contract.
              </p>
            </div>
            <button
              type="button"
              onClick={onSwitchNetwork}
              className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold text-white bg-gradient-to-b from-coffee-700 to-coffee-800 border border-coffee-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:from-coffee-600 hover:to-coffee-700 transition-colors"
            >
              Switch to Sepolia
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

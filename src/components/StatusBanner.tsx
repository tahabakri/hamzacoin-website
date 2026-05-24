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

  return (
    <div className="fixed top-24 left-0 right-0 z-40 px-6 pointer-events-none">
      <div className="max-w-7xl mx-auto space-y-2">
        {error && (
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
              className="shrink-0 text-red-700 hover:text-red-900 transition-colors"
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

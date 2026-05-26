/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_FAUCET_ADDRESS?: string;
  /**
   * Optional dedicated Sepolia RPC URL (Alchemy / Infura / QuickNode / Tenderly).
   * When set, used as the primary endpoint; the public RPCs become fallbacks.
   * Strongly recommended — public Sepolia RPCs rate-limit (HTTP 429) when
   * many hooks poll in parallel.
   */
  readonly VITE_SEPOLIA_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

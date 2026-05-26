export const HMZ_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
] as const;

export const CONTRACT_ADDRESS = "0x619F30ec004442cdc3BE060FC927A3688054e6c3";
export const SEPOLIA_CHAIN_ID = "0xaa36a7";
// PublicNode primary, dRPC backup — both free, key-free.
// Ankr now gates rpc.ankr.com/eth_sepolia behind an API key.
export const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";
// Browser-callable: each endpoint below must return Access-Control-Allow-Origin: *
// for localhost origins. BlastAPI's free public endpoint does NOT, so it's out.
export const SEPOLIA_RPCS: readonly string[] = [
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://sepolia.drpc.org",
  "https://1rpc.io/sepolia",
];
export const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io";

export const HISTORY_BLOCK_RANGE = 50_000n;
export const MAX_FEED_ITEMS = 20;
export const TOTAL_SUPPLY_POLL_MS = 30_000;

// ----------------------------------------------------------------------------
// HamzaFaucet — "Learn & Earn HMZ" contract on Sepolia.
// ----------------------------------------------------------------------------
// Address comes from VITE_FAUCET_ADDRESS at build time; empty string means
// the feature is not configured (UI will disable the claim button with a
// friendly message instead of crashing).
export const FAUCET_ADDRESS: string =
  (import.meta.env.VITE_FAUCET_ADDRESS ?? "").trim();

export const BACKEND_URL: string =
  (import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3001").trim();

// Minimal ABI — only what the frontend actually calls.
export const FAUCET_ABI = [
  "function claimReward(uint8 score, bytes32 articleHash, bytes signature)",
  "function claimed(bytes32) view returns (bool)",
  "function trustedSigner() view returns (address)",
  "function faucetBalance() view returns (uint256)",
  "event RewardClaimed(address indexed user, uint8 score, bytes32 indexed articleHash, uint256 reward)",
] as const;

export type Transfer = {
  id: number;
  from: string;
  to: string;
  amount: string;
  recommendation: string;
  timestamp: number;
};

const SEED_NOW = Date.now();

export const SEED_TRANSFERS: Transfer[] = [
  {
    id: 1,
    from: "0x3aF8...9d21",
    to: "0x619F...e6c3",
    amount: "5",
    recommendation: "Sample transfer (shown before you connect a wallet)",
    timestamp: SEED_NOW - 1000 * 60 * 18,
  },
  {
    id: 2,
    from: "0x12Cc...d942",
    to: "0x74Ab...c112",
    amount: "2",
    recommendation: "Sample transfer (shown before you connect a wallet)",
    timestamp: SEED_NOW - 1000 * 60 * 47,
  },
  {
    id: 3,
    from: "0x89Df...f551",
    to: "0x22Ee...a991",
    amount: "3",
    recommendation: "Sample transfer (shown before you connect a wallet)",
    timestamp: SEED_NOW - 1000 * 60 * 60 * 2,
  },
];

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
export const SEPOLIA_RPCS: readonly string[] = [
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://sepolia.drpc.org",
  "https://eth-sepolia.public.blastapi.io",
];
export const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io";

export const HISTORY_BLOCK_RANGE = 50_000n;
export const MAX_FEED_ITEMS = 20;
export const TOTAL_SUPPLY_POLL_MS = 30_000;

export type Transfer = {
  id: number;
  type: "checkin" | "music" | "book" | "direct";
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
    type: "checkin",
    from: "0x3aF8...9d21",
    to: "0x619F...e6c3",
    amount: "5",
    recommendation: "Coffee check-in: 'Solitude Brews' Cafe",
    timestamp: SEED_NOW - 1000 * 60 * 18,
  },
  {
    id: 2,
    type: "music",
    from: "0x12Cc...d942",
    to: "0x74Ab...c112",
    amount: "2",
    recommendation: "Shared: 'Quietly Yours' by Warm Melodies",
    timestamp: SEED_NOW - 1000 * 60 * 47,
  },
  {
    id: 3,
    type: "book",
    from: "0x89Df...f551",
    to: "0x22Ee...a991",
    amount: "3",
    recommendation: "Recommended reading: 'The Art of Solitude'",
    timestamp: SEED_NOW - 1000 * 60 * 60 * 2,
  },
];

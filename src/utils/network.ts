import { SEPOLIA_CHAIN_ID, SEPOLIA_RPC, SEPOLIA_EXPLORER } from "./constants";

type WalletSwitchError = { code: number; message?: string };

const isSwitchError = (err: unknown): err is WalletSwitchError =>
  typeof err === "object" && err !== null && "code" in err;

export const ensureSepoliaNetwork = async (
  ethereum: EthereumProvider,
): Promise<void> => {
  const hexChainId = (await ethereum.request({
    method: "eth_chainId",
  })) as string;

  if (hexChainId === SEPOLIA_CHAIN_ID) return;

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  } catch (switchError) {
    if (isSwitchError(switchError) && switchError.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID,
            chainName: "Sepolia Test Network",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: [SEPOLIA_RPC],
            blockExplorerUrls: [SEPOLIA_EXPLORER],
          },
        ],
      });
      return;
    }
    throw switchError;
  }
};

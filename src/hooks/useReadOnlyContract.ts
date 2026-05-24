import { useMemo } from "react";
import {
  Contract,
  FallbackProvider,
  JsonRpcProvider,
  Network,
  type AbstractProvider,
} from "ethers";
import { CONTRACT_ADDRESS, HMZ_ABI, SEPOLIA_RPCS } from "../utils/constants";

export type ReadOnlyContractApi = {
  provider: AbstractProvider;
  contract: Contract;
};

let cachedProvider: AbstractProvider | null = null;
let cachedContract: Contract | null = null;

const SEPOLIA_NETWORK = new Network("sepolia", 11155111);

const buildProvider = (): AbstractProvider => {
  const configs = SEPOLIA_RPCS.map((url, idx) => {
    const inner = new JsonRpcProvider(url, SEPOLIA_NETWORK, {
      staticNetwork: SEPOLIA_NETWORK,
    });
    inner.pollingInterval = 8_000;
    return {
      provider: inner,
      priority: idx + 1,
      stallTimeout: 2_000,
      weight: 1,
    };
  });

  if (configs.length === 1) {
    return configs[0].provider;
  }

  return new FallbackProvider(configs, SEPOLIA_NETWORK, {
    quorum: 1,
    pollingInterval: 8_000,
  });
};

const getProvider = (): AbstractProvider => {
  if (!cachedProvider) {
    cachedProvider = buildProvider();
  }
  return cachedProvider;
};

const getContract = (): Contract => {
  if (!cachedContract) {
    cachedContract = new Contract(CONTRACT_ADDRESS, HMZ_ABI, getProvider());
  }
  return cachedContract;
};

export function useReadOnlyContract(): ReadOnlyContractApi {
  return useMemo<ReadOnlyContractApi>(
    () => ({
      provider: getProvider(),
      contract: getContract(),
    }),
    [],
  );
}

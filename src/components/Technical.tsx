import { Icon } from "@iconify/react";
import {
  CONTRACT_ADDRESS,
  FAUCET_ADDRESS,
  SEPOLIA_EXPLORER,
} from "../utils/constants";

const HAMZACOIN_SNIPPET = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract HamzaCoin is ERC20 {
    constructor() ERC20("HamzaCoin", "HMZ") {
        _mint(msg.sender, 50000 * 10 ** decimals());
    }
}`;

const HAMZAFAUCET_SNIPPET = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract HamzaFaucet is EIP712, Ownable {
    bytes32 private constant CLAIM_TYPEHASH = keccak256(
      "Claim(address user,uint8 score,bytes32 articleHash)"
    );

    function claimReward(
        uint8 score,
        bytes32 articleHash,
        bytes calldata signature
    ) external {
        bytes32 digest = _hashTypedDataV4(keccak256(
          abi.encode(CLAIM_TYPEHASH, msg.sender, score, articleHash)
        ));
        require(
          ECDSA.recover(digest, signature) == trustedSigner,
          "Invalid signature"
        );
        // ... mark claimed, transfer score * 1 HMZ
    }
}`;

export function Technical() {
  return (
    <section id="technical" className="max-w-7xl mx-auto px-6 py-12 sm:py-20">
      <div className="text-center max-w-5xl mx-auto mb-14">
        <p className="font-mono text-xs font-semibold tracking-[-0.04em] text-coffee-600 mb-4">
          SPECIFICATIONS
        </p>
        <h2 className="text-fluid-h2 font-normal tracking-tight text-coffee-950">
          Two open-source contracts
          <span className="block font-semibold italic text-coffee-800">
            on Sepolia.
          </span>
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-stretch">
        <div className="flex flex-col justify-center space-y-6">
          <div className="rounded-2xl bg-white border border-coffee-100 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-coffee-950 mb-3">
              HamzaCoin — the ERC20 token
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed font-light">
              Built on OpenZeppelin&apos;s audited ERC20. 18 decimals to match
              ETH&apos;s convention so wallets display HMZ consistently. Total
              supply is fixed at 50,000 HMZ — minted once in the constructor,
              never again.
            </p>
            <a
              href={`${SEPOLIA_EXPLORER}/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-coffee-700 font-bold underline"
            >
              View HamzaCoin on Etherscan
              <Icon icon="solar:arrow-right-linear" className="text-sm" />
            </a>
          </div>

          <div className="rounded-2xl bg-white border border-coffee-100 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-coffee-950 mb-3">
              HamzaFaucet — the Learn & Earn payout
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed font-light mb-4">
              The faucet contract verifies an EIP-712 signature from the
              backend before paying out. score × 1 HMZ per claim, one claim
              per (user, article). Source includes the typed-data digest and
              ECDSA.recover plumbing.
            </p>
            {FAUCET_ADDRESS ? (
              <a
                href={`${SEPOLIA_EXPLORER}/address/${FAUCET_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-coffee-700 font-bold underline"
              >
                View HamzaFaucet on Etherscan
                <Icon icon="solar:arrow-right-linear" className="text-sm" />
              </a>
            ) : (
              <p className="text-xs text-coffee-500 font-mono italic">
                Faucet address not yet configured.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl bg-coffee-950 text-coffee-100 p-6 font-mono text-xs leading-relaxed overflow-x-auto shadow-xl border border-coffee-800">
            <div className="flex items-center justify-between pb-4 border-b border-coffee-800 mb-4">
              <span className="text-coffee-400">HamzaCoin.sol</span>
              <span className="text-[10px] text-amber-400">SOLIDITY v0.8.20</span>
            </div>
            <pre className="text-[11px] text-stone-300">{HAMZACOIN_SNIPPET}</pre>
          </div>

          <div className="rounded-3xl bg-coffee-950 text-coffee-100 p-6 font-mono text-xs leading-relaxed overflow-x-auto shadow-xl border border-coffee-800">
            <div className="flex items-center justify-between pb-4 border-b border-coffee-800 mb-4">
              <span className="text-coffee-400">HamzaFaucet.sol</span>
              <span className="text-[10px] text-amber-400">EIP-712</span>
            </div>
            <pre className="text-[11px] text-stone-300">{HAMZAFAUCET_SNIPPET}</pre>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Icon } from "@iconify/react";
import { CONTRACT_ADDRESS, SEPOLIA_EXPLORER } from "../utils/constants";

const SOLIDITY_SNIPPET = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HamzaCoin is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 50000 * 10**18;

    constructor() ERC20("HamzaCoin", "HMZ") Ownable(msg.sender) {
        _mint(msg.sender, MAX_SUPPLY);
    }

    // Standard transfer hooks or logs
    function transfer(address to, uint256 value)
        public
        override
        returns (bool)
    {
        return super.transfer(to, value);
    }
}`;

export function Technical() {
  return (
    <section id="technical" className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center max-w-5xl mx-auto mb-14">
        <p className="font-mono text-xs font-semibold tracking-[-0.04em] text-coffee-600 mb-4">
          SPECIFICATIONS
        </p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-coffee-950 leading-[1.05]">
          Standard OpenZeppelin ERC20
          <span className="block font-semibold italic text-coffee-800">
            on Sepolia Network.
          </span>
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-stretch">
        <div className="flex flex-col justify-center space-y-6">
          <div className="rounded-2xl bg-white border border-coffee-100 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-coffee-950 mb-3">
              ERC20 Standard Security
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed font-light">
              HamzaCoin is built on standard, thoroughly audited smart
              contracts. Decimals are calibrated precisely to 18 positions to
              support micro-recommendation tip fractions.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-coffee-100 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-coffee-950 mb-3">
              Verified Deployment
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed font-light mb-4">
              The source code is published openly and verified on Etherscan
              block explorer. Total supply limits are locked eternally, assuring
              zero inflation risk.
            </p>
            <a
              href={`${SEPOLIA_EXPLORER}/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-coffee-700 font-bold underline"
            >
              Verify on Sepolia Etherscan
              <Icon icon="solar:arrow-right-linear" className="text-sm" />
            </a>
          </div>
        </div>

        <div className="rounded-3xl bg-coffee-950 text-coffee-100 p-6 font-mono text-xs leading-relaxed overflow-x-auto shadow-xl border border-coffee-800">
          <div className="flex items-center justify-between pb-4 border-b border-coffee-800 mb-4">
            <span className="text-coffee-400">HamzaCoin.sol</span>
            <span className="text-[10px] text-amber-400">SOLIDITY v0.8.20</span>
          </div>
          <pre className="text-[11px] text-stone-300">{SOLIDITY_SNIPPET}</pre>
        </div>
      </div>
    </section>
  );
}

import { CONTRACT_ADDRESS, SEPOLIA_EXPLORER } from "../utils/constants";

type Props = {
  onCopyContract: () => void;
};

export function Footer({ onCopyContract }: Props) {
  return (
    <footer className="relative z-10 w-full bg-white/72 border-t border-white shadow-[inset_0_1px_0_white] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-coffee-200 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-10 lg:gap-16">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <a href="#" className="flex items-center gap-3 group">
              <span className="w-10 h-10 rounded-full bg-gradient-to-b from-white to-coffee-100 border border-coffee-200 flex items-center justify-center shadow-sm">
                <span className="font-mono text-xs font-bold tracking-tight text-coffee-700">
                  HM
                </span>
              </span>
              <span className="flex flex-col justify-center leading-none">
                <span className="font-mono text-sm font-bold tracking-tight text-coffee-950">
                  HAMZACOIN
                </span>
                <span className="mt-1 text-[10px] font-light text-coffee-500">
                  Quiet Recommendations
                </span>
              </span>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-6 text-stone-500 font-light">
              A Web3 protocol layer built to reward the actions, rituals, reads,
              and sounds that make life meaningful.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-coffee-50 border border-coffee-100 px-3 py-1.5 text-xs text-coffee-700 shadow-[inset_0_1px_0_white] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-coffee-600"></span>
              Cozy & Connected
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
            <div>
              <p className="font-mono text-[10px] font-semibold text-stone-400 uppercase mb-4">
                Contract Details
              </p>
              <div className="flex flex-col gap-3 text-sm text-stone-500 font-light">
                <button
                  onClick={onCopyContract}
                  className="hover:text-coffee-600 text-left"
                >
                  Copy Address
                </button>
                <a
                  href={`${SEPOLIA_EXPLORER}/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-coffee-600"
                >
                  Sepolia Explorer
                </a>
                <span className="text-xs font-mono text-coffee-500 bg-coffee-100 px-2 py-1 rounded w-fit self-center sm:self-auto">
                  0x619F...e6c3
                </span>
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] font-semibold text-stone-400 uppercase mb-4">
                Earn Methods
              </p>
              <div className="flex flex-col gap-3 text-sm text-stone-500 font-light">
                <a href="#capabilities" className="hover:text-coffee-600">
                  Cafe Check-in
                </a>
                <a href="#capabilities" className="hover:text-coffee-600">
                  Acoustic Shares
                </a>
                <a href="#capabilities" className="hover:text-coffee-600">
                  Book Summarizing
                </a>
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] font-semibold text-stone-400 uppercase mb-4">
                Creator Socials
              </p>
              <div className="flex flex-col gap-3 text-sm text-stone-500 font-light">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-coffee-600"
                >
                  GitHub Codebase
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-coffee-600"
                >
                  X / Twitter
                </a>
                <span className="text-xs text-coffee-600 font-semibold bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full w-fit self-center sm:self-auto shadow-sm">
                  Built with Solidity & React
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-coffee-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-400 font-light">
            © 2026 HamzaCoin. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-stone-400 font-light">
            <span className="hover:text-coffee-600">
              Minimalist Web3 Protocol Layer
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

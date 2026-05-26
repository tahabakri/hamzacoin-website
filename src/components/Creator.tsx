export function Creator() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20 text-center relative overflow-hidden">
      <div className="absolute -inset-10 bg-gradient-to-b from-transparent via-amber-100/10 to-transparent blur-2xl pointer-events-none"></div>
      <p className="relative font-mono text-xs font-semibold tracking-[-0.04em] text-coffee-600 mb-3">
        ABOUT THE CREATOR
      </p>
      <h2 className="relative text-3xl md:text-4xl font-normal text-coffee-950 mb-6">
        Why I built this.
      </h2>
      <p className="relative text-base md:text-lg leading-8 text-stone-700 font-light max-w-2xl mx-auto mb-8">
        "I built this to learn ERC20, EIP-712 signature verification, AI
        integration, and end-to-end Web3 in one project. Three real features,
        no fake activity, all source on GitHub."
      </p>
      <div className="flex items-center justify-center gap-3">
        <span className="w-8 h-px bg-coffee-300"></span>
        <span className="text-xs font-semibold text-coffee-600 tracking-wider">
          TAHA BAKRI · LEARNING PROJECT
        </span>
        <span className="w-8 h-px bg-coffee-300"></span>
      </div>
    </section>
  );
}

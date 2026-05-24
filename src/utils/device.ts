// Mobile / Web3 environment helpers. Pure functions — safe to call from any
// render path, but check `typeof window` for SSR safety.

const MOBILE_UA_RE =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

export const isMobileUA = (): boolean => {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent || "";
  if (MOBILE_UA_RE.test(ua)) return true;
  // Belt and suspenders: coarse pointer is touchscreen, iPadOS 13+ reports
  // desktop UA but has touch + small max-touch-points.
  const coarse =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const touch =
    "ontouchstart" in window || (window.navigator.maxTouchPoints ?? 0) > 1;
  return coarse && touch;
};

export const isInMetaMaskBrowser = (): boolean => {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent || "";
  // The MetaMask mobile in-app browser appends "MetaMaskMobile" to the UA.
  if (/MetaMaskMobile/i.test(ua)) return true;
  // Fallback: on mobile UA, if window.ethereum.isMetaMask is true, we're
  // almost certainly inside their browser (desktop extension is also
  // isMetaMask true, but desktop UA wouldn't pass isMobileUA).
  const eth = (window as { ethereum?: { isMetaMask?: boolean } }).ethereum;
  return Boolean(eth?.isMetaMask) && isMobileUA();
};

export const buildMetaMaskDeepLink = (): string => {
  if (typeof window === "undefined") {
    return "https://metamask.app.link/";
  }
  const { host, pathname, search } = window.location;
  return `https://metamask.app.link/dapp/${host}${pathname}${search}`;
};

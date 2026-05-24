export const formatAddress = (addr: string): string => {
  if (!addr) return "";
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

export const formatBalance = (raw: string, decimals = 2): string => {
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return "0.00";
  return n.toFixed(decimals);
};

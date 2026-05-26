type EthersLikeError = {
  code?: string | number;
  reason?: string;
  shortMessage?: string;
  message?: string;
  info?: { error?: { code?: number; message?: string } };
  error?: { message?: string };
  data?: string;
};

export const friendlyError = (err: unknown): string => {
  const e = err as EthersLikeError;

  if (e?.code === "ACTION_REJECTED" || e?.code === 4001) {
    return "Transaction rejected in MetaMask.";
  }
  if (e?.code === "INSUFFICIENT_FUNDS") {
    return "Not enough SepoliaETH for gas. Grab some from a faucet.";
  }

  const reason = e?.reason ?? "";
  if (reason.includes("ERC20InsufficientBalance")) {
    return "Your wallet doesn't have enough HMZ to send that amount.";
  }
  if (reason.includes("ERC20InvalidReceiver")) {
    return "Recipient address is invalid for this contract.";
  }
  if (reason.includes("Already claimed")) {
    return "You've already claimed the reward for this article.";
  }
  if (reason.includes("Invalid signature")) {
    return "The backend signature was rejected. Please re-grade the quiz.";
  }
  if (reason.includes("Invalid score")) {
    return "Invalid score in claim payload.";
  }
  if (reason.includes("HMZ transfer failed")) {
    return "The faucet ran out of HMZ. Please ask the owner to refill it.";
  }

  const inner = e?.info?.error?.message ?? e?.error?.message ?? "";
  if (inner.toLowerCase().includes("insufficient funds")) {
    return "Not enough SepoliaETH for gas.";
  }
  if (
    inner.toLowerCase().includes("user denied") ||
    inner.toLowerCase().includes("user rejected")
  ) {
    return "Transaction rejected in MetaMask.";
  }

  return (
    e?.shortMessage ||
    e?.reason ||
    inner ||
    e?.message ||
    "Execution failed. Check gas, network, and balance."
  );
};

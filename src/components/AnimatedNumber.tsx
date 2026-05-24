import { useAnimatedNumber } from "../hooks/useAnimatedNumber";

type Props = {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  enabled?: boolean;
  className?: string;
  ariaLabel?: string;
};

const formatNumber = (n: number, decimals: number): string => {
  if (!Number.isFinite(n)) return "0";
  const fixed = n.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const withCommas = Number(intPart).toLocaleString("en-US");
  return decPart ? `${withCommas}.${decPart}` : withCommas;
};

export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  durationMs = 800,
  enabled = true,
  className,
  ariaLabel,
}: Props) {
  const animated = useAnimatedNumber(value, durationMs, enabled);
  const text = `${prefix}${formatNumber(animated, decimals)}${suffix}`;
  const exact = `${prefix}${formatNumber(value, decimals)}${suffix}`;

  return (
    <span
      className={className}
      aria-label={ariaLabel ?? exact}
      aria-live="polite"
    >
      {text}
    </span>
  );
}

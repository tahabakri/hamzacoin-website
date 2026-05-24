import { useEffect, useRef, useState } from "react";

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export function useAnimatedNumber(
  target: number,
  durationMs = 800,
  enabled = true,
): number {
  const [displayValue, setDisplayValue] = useState<number>(target);
  const startValueRef = useRef<number>(target);
  const beginAtRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setDisplayValue(target);
      return;
    }
    if (!Number.isFinite(target)) return;
    if (Math.abs(target - startValueRef.current) < 0.0000001) {
      return;
    }

    startValueRef.current = displayValue;
    beginAtRef.current = performance.now();

    const tick = () => {
      const elapsed = performance.now() - beginAtRef.current;
      const t = Math.min(1, elapsed / durationMs);
      const eased = easeOutCubic(t);
      const next =
        startValueRef.current + (target - startValueRef.current) * eased;
      setDisplayValue(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
    // displayValue intentionally not in deps — would cause infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs, enabled]);

  return displayValue;
}

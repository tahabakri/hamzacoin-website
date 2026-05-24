import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  rootMargin?: string;
  minHeightPx?: number;
  placeholder?: ReactNode;
};

// Defers rendering of `children` until the wrapper enters (or nearly enters)
// the viewport. Once mounted, children stay mounted — this is for first-load
// cost, not for unloading offscreen content.
export function LazyMount({
  children,
  rootMargin = "300px",
  minHeightPx = 600,
  placeholder,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const el = sentinelRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted, rootMargin]);

  if (mounted) return <>{children}</>;

  return (
    <div ref={sentinelRef} style={{ minHeight: minHeightPx }}>
      {placeholder ?? null}
    </div>
  );
}

import { useEffect, useState } from "react";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["week", 7 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
  ["second", 1000],
];

export const formatRelative = (timestampMs: number): string => {
  const deltaMs = timestampMs - Date.now();
  const absDelta = Math.abs(deltaMs);
  if (absDelta < 15_000) return "just now";

  for (const [unit, msInUnit] of UNITS) {
    if (absDelta >= msInUnit || unit === "second") {
      const value = Math.round(deltaMs / msInUnit);
      return rtf.format(value, unit);
    }
  }
  return "just now";
};

export const formatExact = (timestampMs: number): string => {
  return new Date(timestampMs).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export function useRelativeTime(timestampMs: number): string {
  const [text, setText] = useState<string>(() => formatRelative(timestampMs));

  useEffect(() => {
    setText(formatRelative(timestampMs));
    const id = window.setInterval(() => {
      setText(formatRelative(timestampMs));
    }, 10_000);
    return () => window.clearInterval(id);
  }, [timestampMs]);

  return text;
}

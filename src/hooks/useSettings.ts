import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hmz-settings-v1";

export type ReduceMotionMode = "auto" | "on" | "off";

export type Settings = {
  soundEnabled: boolean;
  ambientEnabled: boolean;
  reduceMotionOverride: ReduceMotionMode;
};

const DEFAULT_SETTINGS: Settings = {
  soundEnabled: false,
  ambientEnabled: false,
  reduceMotionOverride: "auto",
};

const isReduceMotionMode = (v: unknown): v is ReduceMotionMode =>
  v === "auto" || v === "on" || v === "off";

const readStored = (): Settings => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      soundEnabled:
        typeof parsed.soundEnabled === "boolean"
          ? parsed.soundEnabled
          : DEFAULT_SETTINGS.soundEnabled,
      ambientEnabled:
        typeof parsed.ambientEnabled === "boolean"
          ? parsed.ambientEnabled
          : DEFAULT_SETTINGS.ambientEnabled,
      reduceMotionOverride: isReduceMotionMode(parsed.reduceMotionOverride)
        ? parsed.reduceMotionOverride
        : DEFAULT_SETTINGS.reduceMotionOverride,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export type SettingsState = Settings & {
  reduceMotion: boolean;
  setSoundEnabled: (v: boolean) => void;
  setAmbientEnabled: (v: boolean) => void;
  setReduceMotionOverride: (v: ReduceMotionMode) => void;
};

export function useSettings(): SettingsState {
  const [settings, setSettings] = useState<Settings>(readStored);
  const [osPrefersReduced, setOsPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setOsPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setOsPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore quota / disabled storage
    }
  }, [settings]);

  const reduceMotion =
    settings.reduceMotionOverride === "on"
      ? true
      : settings.reduceMotionOverride === "off"
        ? false
        : osPrefersReduced;

  const setSoundEnabled = useCallback(
    (v: boolean) => setSettings((s) => ({ ...s, soundEnabled: v })),
    [],
  );
  const setAmbientEnabled = useCallback(
    (v: boolean) => setSettings((s) => ({ ...s, ambientEnabled: v })),
    [],
  );
  const setReduceMotionOverride = useCallback(
    (v: ReduceMotionMode) =>
      setSettings((s) => ({ ...s, reduceMotionOverride: v })),
    [],
  );

  return {
    ...settings,
    reduceMotion,
    setSoundEnabled,
    setAmbientEnabled,
    setReduceMotionOverride,
  };
}

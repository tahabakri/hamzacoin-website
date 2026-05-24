import { useCallback, useEffect, useRef } from "react";
import {
  playBellDing,
  playErrorTone,
  startBrownNoise,
  type AmbientHandle,
} from "../utils/audio";

type AudioContextCtor = typeof AudioContext;

const getAudioContextCtor = (): AudioContextCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
};

export type SoundApi = {
  playDing: () => void;
  playError: () => void;
};

export function useSound(soundEnabled: boolean, ambientEnabled: boolean): SoundApi {
  const ctxRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<AmbientHandle | null>(null);

  const ensureCtx = useCallback((): AudioContext | null => {
    if (ctxRef.current) return ctxRef.current;
    const Ctor = getAudioContextCtor();
    if (!Ctor) return null;
    try {
      ctxRef.current = new Ctor();
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  // Manage ambient lifecycle
  useEffect(() => {
    if (ambientEnabled) {
      const ctx = ensureCtx();
      if (!ctx) return;
      void ctx.resume();
      if (!ambientRef.current) {
        ambientRef.current = startBrownNoise(ctx);
      }
    } else if (ambientRef.current) {
      ambientRef.current.stop();
      ambientRef.current = null;
    }
  }, [ambientEnabled, ensureCtx]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ambientRef.current) {
        ambientRef.current.stop();
        ambientRef.current = null;
      }
      if (ctxRef.current) {
        void ctxRef.current.close();
        ctxRef.current = null;
      }
    };
  }, []);

  const playDing = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    void ctx.resume();
    try {
      playBellDing(ctx);
    } catch {
      // suspended or hardware issue — silently ignore
    }
  }, [soundEnabled, ensureCtx]);

  const playError = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    void ctx.resume();
    try {
      playErrorTone(ctx);
    } catch {
      // ignore
    }
  }, [soundEnabled, ensureCtx]);

  return { playDing, playError };
}

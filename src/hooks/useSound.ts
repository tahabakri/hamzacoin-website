import { useCallback, useEffect, useRef, useState } from "react";
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
  getAnalyser: () => AnalyserNode | null;
  lastPlayedAt: number | null;
};

export function useSound(soundEnabled: boolean, ambientEnabled: boolean): SoundApi {
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ambientRef = useRef<AmbientHandle | null>(null);
  const [lastPlayedAt, setLastPlayedAt] = useState<number | null>(null);

  const ensureCtx = useCallback((): AudioContext | null => {
    if (ctxRef.current) return ctxRef.current;
    const Ctor = getAudioContextCtor();
    if (!Ctor) return null;
    try {
      const ctx = new Ctor();
      ctxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.65;
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
      return ctx;
    } catch {
      return null;
    }
  }, []);

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

  useEffect(() => {
    return () => {
      if (ambientRef.current) {
        ambientRef.current.stop();
        ambientRef.current = null;
      }
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
        } catch {
          // ignore
        }
        analyserRef.current = null;
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
      const output = analyserRef.current ?? ctx.destination;
      playBellDing(ctx, output);
      setLastPlayedAt(Date.now());
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
      const output = analyserRef.current ?? ctx.destination;
      playErrorTone(ctx, output);
      setLastPlayedAt(Date.now());
    } catch {
      // ignore
    }
  }, [soundEnabled, ensureCtx]);

  const getAnalyser = useCallback(() => analyserRef.current, []);

  return { playDing, playError, getAnalyser, lastPlayedAt };
}

export type AmbientHandle = {
  stop: () => void;
};

export const playBellDing = (
  ctx: AudioContext,
  output: AudioNode = ctx.destination,
  freq = 800,
  durationMs = 600,
): void => {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.connect(gain).connect(output);
  osc.start(now);
  osc.stop(now + durationMs / 1000);
};

export const playErrorTone = (
  ctx: AudioContext,
  output: AudioNode = ctx.destination,
): void => {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 320;
  gain.gain.setValueAtTime(0.16, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
  osc.connect(gain).connect(output);
  osc.start(now);
  osc.stop(now + 0.32);
};

export const startBrownNoise = (ctx: AudioContext): AmbientHandle => {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = data[i];
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 500;

  const gain = ctx.createGain();
  gain.gain.value = 0.08;

  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();

  let stopped = false;
  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      try {
        source.stop();
      } catch {
        // already stopped
      }
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    },
  };
};

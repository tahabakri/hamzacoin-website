import confetti from "canvas-confetti";

export const CONFETTI_COLORS = [
  "#84644D",
  "#D4C4B0",
  "#FAF8F5",
  "#E6B97A",
  "#B87333",
];

export const fireSideCannons = (durationMs = 3000): void => {
  const end = Date.now() + durationMs;
  const tick = () => {
    if (Date.now() > end) return;
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
      colors: CONFETTI_COLORS,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
      colors: CONFETTI_COLORS,
      disableForReducedMotion: true,
    });
    requestAnimationFrame(tick);
  };
  tick();
};

import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";

type Props = {
  enabled: boolean;
  lastPlayedAt: number | null;
  getAnalyser: () => AnalyserNode | null;
};

const VISIBLE_AFTER_PLAY_MS = 2000;

export function AudioVisualizer({ enabled, lastPlayedAt, getAnalyser }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    if (!enabled || !lastPlayedAt) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), VISIBLE_AFTER_PLAY_MS);
    return () => clearTimeout(t);
  }, [enabled, lastPlayedAt]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const dataArray = new Uint8Array(64);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visibleRef.current) {
        ctx.clearRect(0, 0, width, height);
        return;
      }
      const analyser = getAnalyser();
      if (!analyser) {
        ctx.clearRect(0, 0, width, height);
        return;
      }
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, width, height);

      const barCount = isMobile ? 24 : 32;
      const gap = 4;
      const barWidth = (width - gap * (barCount - 1)) / barCount;
      const palette = ["#84644D", "#B87333", "#E6B97A", "#D4C4B0"];

      for (let i = 0; i < barCount; i++) {
        const v = dataArray[i] / 255;
        const h = Math.max(2, v * (height - 6));
        const x = i * (barWidth + gap);
        const y = height - h;
        const color = palette[i % palette.length];
        ctx.fillStyle = color;
        ctx.beginPath();
        const radius = Math.min(barWidth / 2, 4);
        const radiusH = Math.min(h / 2, radius);
        ctx.moveTo(x + radiusH, y);
        ctx.lineTo(x + barWidth - radiusH, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radiusH);
        ctx.lineTo(x + barWidth, height);
        ctx.lineTo(x, height);
        ctx.lineTo(x, y + radiusH);
        ctx.quadraticCurveTo(x, y, x + radiusH, y);
        ctx.fill();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [enabled, getAnalyser, isMobile]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed bottom-0 left-0 right-0 z-30 flex justify-center transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="w-full max-w-2xl px-6 pb-4">
        <canvas
          ref={canvasRef}
          className="w-full h-[50px] block"
          style={{ width: "100%", height: 50 }}
        />
      </div>
    </div>
  );
}

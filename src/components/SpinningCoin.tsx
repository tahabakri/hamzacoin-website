import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  reduceMotion: boolean;
  size?: number;
  className?: string;
};

const drawFaceTexture = (size: number): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  radial.addColorStop(0, "#F2E6D8");
  radial.addColorStop(0.55, "#D4B488");
  radial.addColorStop(1, "#7C5635");
  ctx.fillStyle = radial;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(184, 115, 51, 0.7)";
  ctx.lineWidth = Math.max(2, size * 0.018);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(108, 79, 59, 0.35)";
  ctx.lineWidth = Math.max(1, size * 0.008);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(67, 48, 36, 0.95)";
  ctx.font = `900 ${Math.round(size * 0.34)}px "Bebas Neue", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.max(1, size * 0.006);
  ctx.shadowBlur = 0;
  ctx.fillText("HMZ", cx, cy);
  ctx.shadowColor = "transparent";

  const dotCount = 20;
  ctx.fillStyle = "rgba(67, 48, 36, 0.45)";
  for (let i = 0; i < dotCount; i++) {
    const a = (i / dotCount) * Math.PI * 2;
    const dx = cx + Math.cos(a) * r * 0.74;
    const dy = cy + Math.sin(a) * r * 0.74;
    ctx.beginPath();
    ctx.arc(dx, dy, Math.max(1, size * 0.012), 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
};

export function SpinningCoin({ reduceMotion, size = 120, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pxSize = container.clientWidth || size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(pxSize, pxSize);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const faceCanvas = drawFaceTexture(512);
    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.anisotropy = 8;
    faceTexture.colorSpace = THREE.SRGBColorSpace;

    const faceMaterial = new THREE.MeshStandardMaterial({
      map: faceTexture,
      metalness: 0.65,
      roughness: 0.3,
    });
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      metalness: 0.9,
      roughness: 0.35,
    });

    const geometry = new THREE.CylinderGeometry(1, 1, 0.16, 96, 1);
    geometry.rotateX(Math.PI / 2);

    const coin = new THREE.Mesh(geometry, [
      edgeMaterial,
      faceMaterial,
      faceMaterial,
    ]);
    scene.add(coin);

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffe7c2, 0.95);
    key.position.set(2, 2.5, 3);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xfff2db, 0.4);
    fill.position.set(-2, -1, 2);
    scene.add(fill);

    const rim = new THREE.PointLight(0xffd089, 0.6, 10);
    rim.position.set(0, 0, -3);
    scene.add(rim);

    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      targetTiltX = (ny - 0.5) * 0.6;
      targetTiltY = (nx - 0.5) * 0.6;
    };
    const handlePointerLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
    };
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);

    let animationId = 0;
    let lastTime = performance.now();
    const renderLoop = () => {
      animationId = requestAnimationFrame(renderLoop);
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (!reduceMotion) {
        coin.rotation.y += delta * 0.9;
      }

      currentTiltX += (targetTiltX - currentTiltX) * 0.12;
      currentTiltY += (targetTiltY - currentTiltY) * 0.12;
      coin.rotation.x = currentTiltX;
      coin.rotation.z = currentTiltY * 0.3;

      renderer.render(scene, camera);
    };
    renderLoop();

    const handleResize = () => {
      const next = container.clientWidth || size;
      renderer.setSize(next, next);
    };
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(handleResize) : null;
    if (observer) observer.observe(container);

    return () => {
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      if (observer) observer.disconnect();
      geometry.dispose();
      faceMaterial.dispose();
      edgeMaterial.dispose();
      faceTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [reduceMotion, size]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`relative pointer-events-auto ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(230,185,122,0.45), rgba(230,185,122,0) 65%)",
          filter: "blur(14px)",
          transform: "scale(1.4)",
        }}
      />
    </div>
  );
}

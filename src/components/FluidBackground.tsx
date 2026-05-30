import { useEffect, useRef } from "react";
import * as THREE from "three";
import { getConnectionQuality } from "../hooks/useConnectionQuality";

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const SIM_FRAGMENT = /* glsl */ `
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uMouseActive;
  uniform sampler2D uPrevTexture;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 texel = vec2(1.0) / uResolution;

    float center = texture2D(uPrevTexture, uv).r;
    float prevCenter = texture2D(uPrevTexture, uv).g;

    float n = texture2D(uPrevTexture, uv + vec2(0.0, texel.y)).r;
    float s = texture2D(uPrevTexture, uv - vec2(0.0, texel.y)).r;
    float e = texture2D(uPrevTexture, uv + vec2(texel.x, 0.0)).r;
    float w = texture2D(uPrevTexture, uv - vec2(texel.x, 0.0)).r;

    float nextValue = (n + s + e + w) * 0.5 - prevCenter;
    nextValue *= 0.985;

    if (uMouseActive > 0.5) {
      float distToMouse = distance(gl_FragCoord.xy, uMouse * uResolution);
      if (distToMouse < 45.0) {
        float splashStrength = (1.0 - (distToMouse / 45.0)) * 0.35;
        nextValue += splashStrength;
      }
    }

    gl_FragColor = vec4(nextValue, center, 0.0, 1.0);
  }
`;

const RENDER_FRAGMENT = /* glsl */ `
  uniform vec2 uResolution;
  uniform sampler2D uSimTexture;
  uniform sampler2D uTextTexture;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 texel = vec2(1.0) / uResolution;

    float h  = texture2D(uSimTexture, uv).r;
    float hR = texture2D(uSimTexture, uv + vec2(texel.x, 0.0)).r;
    float hU = texture2D(uSimTexture, uv + vec2(0.0, texel.y)).r;

    vec2 gradientDisplacement = vec2(hR - h, hU - h) * 0.12;

    vec4 finalColor = texture2D(uTextTexture, uv + gradientDisplacement);

    float crestShadow = (hR - h) * 0.18;
    finalColor.rgb += vec3(crestShadow);

    gl_FragColor = finalColor;
  }
`;

// The fixed background is a faint, on-brand HMZ coin emblem instead of the old
// "HAMZACOIN" wordmark. The coin reads as a watermark and ripples under the
// fluid shader, without a giant word competing with each section's content.
const drawCoinWatermark = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
) => {
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx.fillStyle = "#FAF8F5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Coin scales with the viewport so it stays centered and never dominates.
  // Slightly larger on phones where the viewport is narrow.
  const isMobile = width < 768;
  const radius =
    Math.min(canvas.width, canvas.height) * (isMobile ? 0.34 : 0.24);

  // coffee-600 line art, kept faint so it reads as background, not content.
  const ink = "108, 79, 59";
  ctx.save();
  ctx.globalAlpha = isMobile ? 0.06 : 0.1;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Soft struck-metal fill so the disc reads as a coin, not just a ring.
  const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  radial.addColorStop(0, `rgba(${ink}, 0.22)`);
  radial.addColorStop(0.72, `rgba(${ink}, 0.1)`);
  radial.addColorStop(1, `rgba(${ink}, 0)`);
  ctx.fillStyle = radial;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Outer rim + inner ring.
  ctx.strokeStyle = `rgba(${ink}, 0.85)`;
  ctx.lineWidth = Math.max(2, radius * 0.018);
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.9, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(${ink}, 0.4)`;
  ctx.lineWidth = Math.max(1, radius * 0.008);
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2);
  ctx.stroke();

  // HMZ monogram, same as the 3D spinning coin.
  ctx.fillStyle = `rgba(${ink}, 0.95)`;
  ctx.font = `600 ${Math.round(radius * 0.6)}px 'Bebas Neue', sans-serif`;
  ctx.fillText("HMZ", cx, cy);

  // Milled edge dots.
  const dotCount = 28;
  ctx.fillStyle = `rgba(${ink}, 0.6)`;
  for (let i = 0; i < dotCount; i++) {
    const a = (i / dotCount) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(
      cx + Math.cos(a) * radius * 0.74,
      cy + Math.sin(a) * radius * 0.74,
      Math.max(1, radius * 0.012),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.restore();
};

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobile = window.innerWidth < 768;
    const isSlow = getConnectionQuality() === "slow";
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Cap dpr lower on mobile to halve the simulation grid pixel count
    // versus desktop retina, then drop the render target by a quality factor.
    const dpr = isMobile
      ? Math.min(window.devicePixelRatio || 1, 1.25)
      : Math.min(window.devicePixelRatio || 1, 2);
    const qualityScale = isSlow ? 0.4 : isMobile ? 0.6 : 1.0;
    const rtScale = dpr * qualityScale;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const textCanvas = document.createElement("canvas");
    const textCtx = textCanvas.getContext("2d");
    if (!textCtx) return;

    drawCoinWatermark(textCanvas, textCtx, width, height, dpr);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);

    const simScene = new THREE.Scene();
    const mainScene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const rtOptions: THREE.RenderTargetOptions = {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    };

    let rtA = new THREE.WebGLRenderTarget(width * rtScale, height * rtScale, rtOptions);
    let rtB = new THREE.WebGLRenderTarget(width * rtScale, height * rtScale, rtOptions);

    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.minFilter = THREE.LinearFilter;
    textTexture.magFilter = THREE.LinearFilter;

    const mouse = new THREE.Vector2(0, 0);
    let isMouseActive = false;

    const simMaterial = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: SIM_FRAGMENT,
      uniforms: {
        uResolution: {
          value: new THREE.Vector2(width * rtScale, height * rtScale),
        },
        uMouse: { value: mouse },
        uMouseActive: { value: 0.0 },
        uPrevTexture: { value: null as THREE.Texture | null },
      },
      depthWrite: false,
      depthTest: false,
    });

    const renderMaterial = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: RENDER_FRAGMENT,
      uniforms: {
        uResolution: {
          value: new THREE.Vector2(width * rtScale, height * rtScale),
        },
        uSimTexture: { value: null as THREE.Texture | null },
        uTextTexture: { value: textTexture },
      },
      depthWrite: false,
      depthTest: false,
    });

    const planeGeometry = new THREE.PlaneGeometry(2, 2);
    const simMesh = new THREE.Mesh(planeGeometry, simMaterial);
    const renderMesh = new THREE.Mesh(planeGeometry, renderMaterial);
    simScene.add(simMesh);
    mainScene.add(renderMesh);

    const handleMouseMove = (e: MouseEvent) => {
      isMouseActive = true;
      mouse.set(e.clientX / width, 1.0 - e.clientY / height);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        isMouseActive = true;
        mouse.set(
          e.touches[0].clientX / width,
          1.0 - e.touches[0].clientY / height,
        );
      }
    };

    const handleMouseLeave = () => {
      isMouseActive = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchend", handleMouseLeave);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      renderer.setSize(width, height);
      rtA.setSize(width * rtScale, height * rtScale);
      rtB.setSize(width * rtScale, height * rtScale);

      simMaterial.uniforms.uResolution.value.set(width * rtScale, height * rtScale);
      renderMaterial.uniforms.uResolution.value.set(width * rtScale, height * rtScale);

      drawCoinWatermark(textCanvas, textCtx, width, height, dpr);
      textTexture.needsUpdate = true;
    };
    window.addEventListener("resize", handleResize);

    // Redraw the coin once Bebas Neue has loaded so the HMZ monogram is correct
    if (document.fonts && document.fonts.ready) {
      void document.fonts.ready.then(() => {
        drawCoinWatermark(textCanvas, textCtx, width, height, dpr);
        textTexture.needsUpdate = true;
      });
    }

    let animationId = 0;
    const renderLoop = () => {
      animationId = requestAnimationFrame(renderLoop);

      if (reduceMotion) {
        // Skip the wave simulation entirely; render the text texture flat.
        renderMaterial.uniforms.uSimTexture.value = rtA.texture;
        renderer.setRenderTarget(null);
        renderer.render(mainScene, camera);
        return;
      }

      simMaterial.uniforms.uPrevTexture.value = rtA.texture;
      simMaterial.uniforms.uMouse.value.copy(mouse);
      simMaterial.uniforms.uMouseActive.value = isMouseActive ? 1.0 : 0.0;

      renderer.setRenderTarget(rtB);
      renderer.render(simScene, camera);

      renderMaterial.uniforms.uSimTexture.value = rtB.texture;
      renderer.setRenderTarget(null);
      renderer.render(mainScene, camera);

      const tmp = rtA;
      rtA = rtB;
      rtB = tmp;
    };
    renderLoop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchend", handleMouseLeave);
      window.removeEventListener("resize", handleResize);

      rtA.dispose();
      rtB.dispose();
      textTexture.dispose();
      simMaterial.dispose();
      renderMaterial.dispose();
      planeGeometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="webgl_canvas"
      className="fixed inset-0 w-screen h-screen z-0 pointer-events-auto"
    />
  );
}

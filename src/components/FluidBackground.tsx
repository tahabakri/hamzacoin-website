import { useEffect, useRef } from "react";
import * as THREE from "three";

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

const drawTextCanvas = (
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

  const titleSize = Math.round(180 * dpr);
  ctx.font = `600 ${titleSize}px 'Bebas Neue', sans-serif`;
  ctx.fillStyle = "rgba(108, 79, 59, 0.08)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "HAMZACOIN",
    canvas.width / 2,
    canvas.height / 2 - 80 * dpr,
  );

  const subSize = Math.round(28 * dpr);
  ctx.font = `300 ${subSize}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = "rgba(132, 100, 77, 0.35)";
  ctx.fillText(
    "THE SILENT RECOMMENDATION PROTOCOL",
    canvas.width / 2,
    canvas.height / 2 + 100 * dpr,
  );
};

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const textCanvas = document.createElement("canvas");
    const textCtx = textCanvas.getContext("2d");
    if (!textCtx) return;

    drawTextCanvas(textCanvas, textCtx, width, height, dpr);

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

    let rtA = new THREE.WebGLRenderTarget(width * dpr, height * dpr, rtOptions);
    let rtB = new THREE.WebGLRenderTarget(width * dpr, height * dpr, rtOptions);

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
          value: new THREE.Vector2(width * dpr, height * dpr),
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
          value: new THREE.Vector2(width * dpr, height * dpr),
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
      rtA.setSize(width * dpr, height * dpr);
      rtB.setSize(width * dpr, height * dpr);

      simMaterial.uniforms.uResolution.value.set(width * dpr, height * dpr);
      renderMaterial.uniforms.uResolution.value.set(width * dpr, height * dpr);

      drawTextCanvas(textCanvas, textCtx, width, height, dpr);
      textTexture.needsUpdate = true;
    };
    window.addEventListener("resize", handleResize);

    // Redraw text once Bebas Neue + JetBrains Mono have loaded
    if (document.fonts && document.fonts.ready) {
      void document.fonts.ready.then(() => {
        drawTextCanvas(textCanvas, textCtx, width, height, dpr);
        textTexture.needsUpdate = true;
      });
    }

    let animationId = 0;
    const renderLoop = () => {
      animationId = requestAnimationFrame(renderLoop);

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

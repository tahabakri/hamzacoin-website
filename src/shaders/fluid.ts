export const VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const SIMULATION_FRAGMENT = /* glsl */ `
precision highp float;

uniform sampler2D textureA;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float time;
uniform float frame;

varying vec2 vUv;

void main() {
  vec2 texelSize = 1.0 / resolution;

  vec4 prev = texture2D(textureA, vUv);

  float left   = texture2D(textureA, vUv + vec2(-1.0, 0.0) * texelSize).r;
  float right  = texture2D(textureA, vUv + vec2( 1.0, 0.0) * texelSize).r;
  float top    = texture2D(textureA, vUv + vec2( 0.0, 1.0) * texelSize).r;
  float bottom = texture2D(textureA, vUv + vec2( 0.0,-1.0) * texelSize).r;

  // Hugo Elias buffer ripple: new = (sum_of_neighbours / 2) - previous, then damp
  // Stored as r = current, g = previous
  float newHeight = (left + right + top + bottom) * 0.5 - prev.g;
  float damping = 0.992;
  newHeight *= damping;

  // Mouse impulse — small radius, gentle amplitude so it reads as a ripple, not a stamp
  if (mouse.x > 0.0 || mouse.y > 0.0) {
    float dist = distance(vUv, mouse);
    float impulse = smoothstep(0.025, 0.0, dist);
    newHeight += impulse * 0.18;
  }

  gl_FragColor = vec4(newHeight, prev.r, 0.0, 1.0);
}
`;

export const RENDER_FRAGMENT = /* glsl */ `
precision highp float;

uniform sampler2D simulation;
uniform sampler2D content;
uniform vec2 resolution;
uniform float time;

varying vec2 vUv;

void main() {
  vec2 texelSize = 1.0 / resolution;

  // Compute gradient from neighbouring simulation samples (normal-like)
  float left   = texture2D(simulation, vUv + vec2(-1.0, 0.0) * texelSize).r;
  float right  = texture2D(simulation, vUv + vec2( 1.0, 0.0) * texelSize).r;
  float top    = texture2D(simulation, vUv + vec2( 0.0, 1.0) * texelSize).r;
  float bottom = texture2D(simulation, vUv + vec2( 0.0,-1.0) * texelSize).r;

  vec2 displacement = vec2(right - left, top - bottom) * 0.05;

  // Sample the content texture with the displacement to create refraction
  vec4 color = texture2D(content, vUv + displacement);

  // Very soft highlight along the wave crests — barely there
  float crest = abs(right - left) + abs(top - bottom);
  color.rgb += vec3(1.0, 0.97, 0.92) * crest * 0.10;

  gl_FragColor = color;
}
`;

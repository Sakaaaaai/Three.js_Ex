export const rippleVertexShader = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uFrequency;

varying vec2 vUv;
varying float vElevation;

void main() {
  vUv = uv;

  vec3 pos = position;

  float dist = distance(uv, uMouse);
  float elevation = sin(dist * uFrequency - uTime * 4.0) * exp(-dist * 6.0) * uAmplitude;
  pos.z += elevation;
  vElevation = elevation;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

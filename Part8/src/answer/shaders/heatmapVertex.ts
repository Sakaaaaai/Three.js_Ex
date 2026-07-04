export const heatmapVertexShader = /* glsl */ `
attribute float aIntensity;
uniform float uSensorBoost;

varying float vIntensity;

void main() {
  vIntensity = aIntensity;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  float baseSize = 40.0 * (1.0 / -mvPosition.z);
  gl_PointSize = baseSize * (0.6 + uSensorBoost * 0.8);

  gl_Position = projectionMatrix * mvPosition;
}
`;

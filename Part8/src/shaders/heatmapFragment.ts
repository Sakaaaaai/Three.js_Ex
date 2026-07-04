export const heatmapFragmentShader = /* glsl */ `
uniform float uSensorBoost;
varying float vIntensity;

vec3 heatmapColor(float t) {
  vec3 lowColor = vec3(0.15, 0.25, 0.65);
  vec3 midColor = vec3(0.2, 0.7, 0.4);
  vec3 highColor = vec3(1.0, 0.35, 0.2);

  if (t < 0.5) {
    return mix(lowColor, midColor, t / 0.5);
  }
  return mix(midColor, highColor, (t - 0.5) / 0.5);
}

void main() {
  // 点を丸く見せるため、中心から離れたピクセルを描画しない
  vec2 coord = gl_PointCoord - vec2(0.5);
  if (length(coord) > 0.5) {
    discard;
  }

  // TODO: vIntensity(点ごとの深度強度)に uSensorBoost(リアルタイムのセンサー値)を
  //       加算し、0〜1にクランプしたうえで heatmapColor に渡してください。
  //
  // ヒント:
  //   float boosted = clamp(vIntensity + uSensorBoost * 0.3, 0.0, 1.0);
  //   vec3 color = heatmapColor(boosted);

  vec3 color = heatmapColor(vIntensity);

  gl_FragColor = vec4(color, 1.0);
}
`;

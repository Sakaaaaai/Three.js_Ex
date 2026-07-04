export const rippleFragmentShader = /* glsl */ `
varying vec2 vUv;
varying float vElevation;

void main() {
  // TODO: vElevation を使い、波紋の高い部分ほど明るく見えるように
  //       色をグラデーションさせてください。
  //
  // ヒント:
  //   vec3 deepColor = vec3(0.1, 0.2, 0.5);
  //   vec3 crestColor = vec3(0.6, 0.9, 1.0);
  //   vec3 color = mix(deepColor, crestColor, vElevation * 3.0 + 0.5);

  vec3 color = vec3(0.15, 0.2, 0.3);

  gl_FragColor = vec4(color, 1.0);
}
`;

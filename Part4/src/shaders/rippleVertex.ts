export const rippleVertexShader = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;

varying vec2 vUv;
varying float vElevation;

void main() {
  vUv = uv;

  vec3 pos = position;

  // TODO: uv平面上での uMouse からの距離(dist)を計算し、
  //       dist と uTime を使って時間とともに減衰する波紋の高さ(elevation)を
  //       計算して pos.z に加算してください。
  //
  // ヒント:
  //   float dist = distance(uv, uMouse);
  //   float elevation = sin(dist * 40.0 - uTime * 4.0) * exp(-dist * 6.0) * 0.15;
  //   pos.z += elevation;
  //   vElevation = elevation;

  float elevation = 0.0; // TODO: 上記のヒントを参考に計算してください
  pos.z += elevation;
  vElevation = elevation;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

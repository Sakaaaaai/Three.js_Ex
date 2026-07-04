import * as THREE from 'three';

const LOW_COLOR = new THREE.Color(0x2b6cb0); // 遠い/弱い: 青
const MID_COLOR = new THREE.Color(0x38a169); // 中間: 緑
const HIGH_COLOR = new THREE.Color(0xe53e3e); // 近い/強い: 赤

// intensity(0〜1)を3色グラデーションのヒートマップ色に変換する。
export function intensityToColor(intensity: number): THREE.Color {
  const clamped = THREE.MathUtils.clamp(intensity, 0, 1);
  const color = new THREE.Color();

  if (clamped < 0.5) {
    color.lerpColors(LOW_COLOR, MID_COLOR, clamped / 0.5);
  } else {
    color.lerpColors(MID_COLOR, HIGH_COLOR, (clamped - 0.5) / 0.5);
  }

  return color;
}

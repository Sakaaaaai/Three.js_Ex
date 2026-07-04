import * as THREE from 'three';

const LOW_COLOR = new THREE.Color(0x2b6cb0);
const MID_COLOR = new THREE.Color(0x38a169);
const HIGH_COLOR = new THREE.Color(0xe53e3e);

export function intensityToColor(value: number): THREE.Color {
  const clamped = THREE.MathUtils.clamp(value, 0, 1);
  const color = new THREE.Color();

  if (clamped < 0.5) {
    color.lerpColors(LOW_COLOR, MID_COLOR, clamped / 0.5);
  } else {
    color.lerpColors(MID_COLOR, HIGH_COLOR, (clamped - 0.5) / 0.5);
  }

  return color;
}

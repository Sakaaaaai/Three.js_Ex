import * as THREE from 'three';
import { intensityToColor } from '../utils/colormap';

export class SensorPointCloud {
  readonly points: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;

  constructor(pointCount: number) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pointCount * 3);

    for (let i = 0; i < pointCount; i++) {
      // フィボナッチ球面配置で、点群を球状に均等分布させる
      const phi = Math.acos(1 - (2 * (i + 0.5)) / pointCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const radius = 2.5;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeBoundingSphere();

    const material = new THREE.PointsMaterial({ size: 0.08, color: 0x4f8fdb });

    this.points = new THREE.Points(geometry, material);
  }

  setSensorValue(value: number): void {
    this.points.material.color.copy(intensityToColor(value));
  }
}

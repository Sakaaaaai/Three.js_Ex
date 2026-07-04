import * as THREE from 'three';
import type { DepthPoint } from '../utils/parseDepthCsv';
import { intensityToColor } from '../utils/colormap';

export class DepthPointCloud {
  readonly points: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;

  constructor(depthPoints: DepthPoint[]) {
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(depthPoints.length * 3);
    const colors = new Float32Array(depthPoints.length * 3);

    depthPoints.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;

      const color = intensityToColor(point.intensity);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    // OrbitControlsでの操作性やフラスタムカリングの判定に必要
    geometry.computeBoundingSphere();

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      sizeAttenuation: true,
    });

    this.points = new THREE.Points(geometry, material);
  }
}

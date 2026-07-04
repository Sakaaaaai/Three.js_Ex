import * as THREE from 'three';
import type { DepthPoint } from '../utils/parseDepthCsv';
import { heatmapVertexShader } from '../shaders/heatmapVertex';
import { heatmapFragmentShader } from '../shaders/heatmapFragment';

export class HeatmapPointCloud {
  readonly points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private readonly uniforms: { uSensorBoost: { value: number } };

  constructor(depthPoints: DepthPoint[]) {
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(depthPoints.length * 3);
    const intensities = new Float32Array(depthPoints.length);

    depthPoints.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
      intensities[i] = point.intensity;
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aIntensity', new THREE.Float32BufferAttribute(intensities, 1));
    geometry.computeBoundingSphere();

    this.uniforms = { uSensorBoost: { value: 0 } };

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: heatmapVertexShader,
      fragmentShader: heatmapFragmentShader,
    });

    this.points = new THREE.Points(geometry, material);
  }

  setSensorBoost(value: number): void {
    this.uniforms.uSensorBoost.value = value;
  }
}

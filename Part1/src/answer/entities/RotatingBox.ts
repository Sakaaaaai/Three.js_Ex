import * as THREE from 'three';
import { boxStore } from '../state/store';

export class RotatingBox {
  readonly mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;

  constructor() {
    const initialState = boxStore.getState();

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: initialState.color });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.scale.setScalar(initialState.size);

    boxStore.subscribe((state) => {
      this.mesh.material.color.set(state.color);
      this.mesh.scale.setScalar(state.size);
    });
  }

  tick(deltaRotation = 0.01): void {
    this.mesh.rotation.x += deltaRotation;
    this.mesh.rotation.y += deltaRotation;
  }
}

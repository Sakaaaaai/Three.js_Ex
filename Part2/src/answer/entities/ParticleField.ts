import * as THREE from 'three';

export interface ParticleFieldOptions {
  count: number;
  spread: number;
}

// 1万個の箱を InstancedMesh 1個(= Draw Call 1回)にまとめて描画するクラス。
// 個々のインスタンスは静的な位置なので、初期化時に一度だけ行列を書き込めばよい。
export class ParticleField {
  readonly mesh: THREE.InstancedMesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;

  constructor({ count, spread }: ParticleFieldOptions) {
    const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const material = new THREE.MeshStandardMaterial({ color: 0x4f8fdb });

    this.mesh = new THREE.InstancedMesh(geometry, material, count);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread
      );
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  tick(rotationDelta: number): void {
    // インスタンスごとの行列は更新せず、InstancedMesh全体を1回だけ回転させる
    this.mesh.rotation.y += rotationDelta;
  }
}

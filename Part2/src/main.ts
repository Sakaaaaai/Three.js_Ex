import * as THREE from 'three';
import Stats from 'stats.js';
import './style.css';

// ============================================================
// このファイルは「1万個のパーティクルをMeshとして1つずつ生成する」
// 素朴な実装です。動作はしますが、Draw Callが1万回発生するため、
// 多くの環境でフレームレートが大きく落ち込みます。
//
// 画面左上に表示されるstats.jsパネルでFPSを確認しながら、
// TODOに沿ってInstancedMeshへの置き換えを行ってください。
// ============================================================

const PARTICLE_COUNT = 10000;
const SPREAD = 80;

const stats = new Stats();
stats.showPanel(0); // 0: FPS
document.body.appendChild(stats.dom);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(0, 0, 60);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('app')?.appendChild(renderer.domElement);

// TODO 1: この for文は、同じジオメトリ・マテリアルを使っているにもかかわらず、
//         1万個の Mesh を個別に生成しているため Draw Call が1万回発生します。
//         THREE.InstancedMesh を使い、1回の Draw Call で済むように書き換えてください。
//         (src/entities/ParticleField.ts のようなクラスに切り出すことを推奨します)
const particleGroup = new THREE.Group();
const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
const material = new THREE.MeshStandardMaterial({ color: 0x4f8fdb });

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    (Math.random() - 0.5) * SPREAD,
    (Math.random() - 0.5) * SPREAD,
    (Math.random() - 0.5) * SPREAD
  );
  particleGroup.add(mesh);
}
scene.add(particleGroup);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// TODO 2: 最適化の前後でFPSを記録し、Before/Afterの数値を比較してください。
//         (stats.jsパネルの数値をメモ、またはスクリーンショットしておく)
function animate(): void {
  stats.begin();
  requestAnimationFrame(animate);

  particleGroup.rotation.y += 0.002;

  renderer.render(scene, camera);
  stats.end();
}

animate();

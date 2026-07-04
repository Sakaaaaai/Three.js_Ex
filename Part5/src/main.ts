import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';
import rawCsv from './data/depth-scan.csv?raw';
import { parseDepthPoints } from './utils/parseDepthCsv';
import { DepthPointCloud } from './entities/DepthPointCloud';

// ============================================================
// Part3で作成した「深度カメラビューア」をベースに、Bloom(発光)効果を
// 追加する演習です。点群の読み込み・表示・OrbitControlsは実装済みです。
// 未実装(TODO)なのは EffectComposer を使ったポストプロセッシング部分です。
// ============================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 3, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('app')?.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const depthPoints = parseDepthPoints(rawCsv);
const pointCloud = new DepthPointCloud(depthPoints);
scene.add(pointCloud.points);

// TODO 1: three/examples/jsm/postprocessing/ から
//         EffectComposer, RenderPass, UnrealBloomPass をインポートしてください。

// TODO 2: EffectComposerを作成し、
//         RenderPass(通常描画) → UnrealBloomPass(発光効果) の順にパスを追加してください。
//         UnrealBloomPassのコンストラクタ引数: (resolution: Vector2, strength, radius, threshold)
//         まずは strength=1.2, radius=0.4, threshold=0.3 あたりから試してみてください。

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // TODO 3: composerとbloomPassのサイズも、リサイズに合わせて更新してください。
});

function animate(): void {
  requestAnimationFrame(animate);
  controls.update();

  // TODO 4: renderer.render(scene, camera) の代わりに、
  //         composer.render() を呼び出してください。
  renderer.render(scene, camera);
}

animate();

import * as THREE from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import './style.css';
import rawCsv from './data/depth-scan.csv?raw';
import { parseDepthPoints } from './utils/parseDepthCsv';
import { connectSensorSocket } from './utils/connectSensorSocket';
import { sensorStore } from './state/sensorStore';
import { heatmapVertexShader } from './shaders/heatmapVertex';
import { heatmapFragmentShader } from './shaders/heatmapFragment';

// ============================================================
// 総仕上げプロジェクト「センサーデータ3Dダッシュボード」
//
// Part1〜7で学んだ以下の要素を統合します。
//   - CSVからの点群読み込み(Part3)
//   - シェーダーベースのヒートマップ表現(Part4)
//   - Bloomポストプロセッシング(Part5)
//   - WebSocketによるリアルタイム更新(Part6)
//   - GUIコントロールパネル(Part6)
//
// CSVパース・WebSocket接続・状態管理(ストア)は実装済みです(前提知識)。
// 未実装(TODO)は、次の3点の「統合」部分です。
//   1. 点群のBufferGeometry構築とShaderMaterialの適用
//   2. EffectComposer(Bloom)のセットアップ
//   3. センサー値をシェーダーのuniformに反映する配線 + GUIパネル
// ============================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a12);

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

// TODO 1: depthPointsから position属性(x, y, z)と
//         aIntensity属性(intensity、itemSize: 1)を持つBufferGeometryを構築し、
//         heatmapVertexShader / heatmapFragmentShader を使った ShaderMaterial を
//         適用した THREE.Points を作成してシーンに追加してください。
//         uniforms には { uSensorBoost: { value: 0 } } を含めてください
//         (あとでセンサー値を反映するために使います)。
const pointCloudUniforms = {
  uSensorBoost: { value: 0 },
};

// TODO 2: EffectComposerを作成し、RenderPass → UnrealBloomPass の順に
//         Passを追加してください。リサイズ時のサイズ更新も忘れずに。

connectSensorSocket();

const guiState = { updateMode: 'realtime' as 'realtime' | 'paused' };
const gui = new GUI();
gui.add(guiState, 'updateMode', ['realtime', 'paused']);

// TODO 3: sensorStoreを購読し、updateModeが'realtime'のときだけ
//         pointCloudUniforms.uSensorBoost.value を更新してください。

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // TODO 4: composerとbloomPassのサイズも更新してください。
});

function animate(): void {
  requestAnimationFrame(animate);
  controls.update();

  // TODO 5: renderer.render(scene, camera) の代わりに composer.render() を呼んでください。
  renderer.render(scene, camera);
}

animate();

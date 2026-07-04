import * as THREE from 'three';
import Papa from 'papaparse';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';
import rawCsv from './data/depth-scan.csv?raw';

// ============================================================
// このファイルは「深度カメラビューア」の骨組みです。
// シーン・カメラ・レンダラーの用意はできていますが、
// 点群データの読み込み・色分け・表示部分は未実装(TODO)です。
// ============================================================

interface DepthPoint {
  x: number;
  y: number;
  z: number;
  intensity: number;
}

// TODO 1: PapaParseを使い、rawCsv(ヘッダー付きCSV文字列)をパースして
//         DepthPoint[] を返してください。
//         ヒント: Papa.parse<DepthPoint>(rawCsv, { header: true, dynamicTyping: true, skipEmptyLines: true })
//         パース結果は result.data に入っています。
function parseDepthPoints(csvText: string): DepthPoint[] {
  throw new Error('TODO: CSVをパースしてDepthPoint[]を返してください');
}

// TODO 2: intensity(0〜1)を THREE.Color に変換する関数を実装してください。
//         例: 低いほど青、高いほど赤になるように、2〜3色の間を lerpColors で補間する
function intensityToColor(intensity: number): THREE.Color {
  throw new Error('TODO: intensityを色に変換してください');
}

// TODO 3: DepthPoint[] から、position属性とcolor属性を持つBufferGeometryを構築してください。
//         - position: point.x, point.y, point.z をそのまま使う
//         - color: intensityToColor(point.intensity) の r, g, b を使う
//         最後に geometry.computeBoundingSphere() を呼ぶのを忘れないこと
//         (OrbitControlsでの操作性やカリングの判定に影響します)
function buildPointCloudGeometry(points: DepthPoint[]): THREE.BufferGeometry {
  throw new Error('TODO: BufferGeometryを構築してください');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101010);

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

// TODO 4: OrbitControlsを作成し、マウスでの回転・ズームができるようにしてください。
//         controls.enableDamping = true にすると、慣性のついた滑らかな操作感になります。
// const controls = new OrbitControls(camera, renderer.domElement);

const depthPoints = parseDepthPoints(rawCsv);
const geometry = buildPointCloudGeometry(depthPoints);

// TODO 5: PointsMaterial(vertexColors: true, size: 0.05 程度)を使い、
//         Pointsオブジェクトを作成してシーンに追加してください。

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate(): void {
  requestAnimationFrame(animate);
  // TODO 6: OrbitControlsを使う場合、ここで controls.update() を呼び出してください。
  renderer.render(scene, camera);
}

animate();

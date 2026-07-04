import * as THREE from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';

// ============================================================
// モックWebSocketサーバー(server/mock-sensor-server.mjs)は実装済みで、
// `npm run dev` を実行すると client(Vite)と同時に自動起動します。
// このファイルでは、シーンの用意と点群の表示は済んでいますが、
// 「WebSocketで受信した値をどう反映するか」の設計(TODO)が未実装です。
// ============================================================

interface SensorPayload {
  timestamp: number;
  sensorValue: number;
}

// TODO 1: color/sensorValueなどの状態を保持するシンプルなPub/Subストアを実装してください。
//         (Part1で作ったストアと同じ考え方です)
//         - getState(): 現在の状態を取得
//         - setState(partial): 状態の一部を更新し、購読者に通知
//         - subscribe(listener): 変更を購読
class SensorStore {
  private state = { sensorValue: 0.5 };

  getState() {
    return this.state;
  }

  setState(partial: Partial<{ sensorValue: number }>): void {
    throw new Error('TODO: 状態を更新し、購読者に通知してください');
  }

  subscribe(listener: (state: { sensorValue: number }) => void): () => void {
    throw new Error('TODO: 購読者を登録し、解除用の関数を返してください');
  }
}

const sensorStore = new SensorStore();

// TODO 2: intensityToColor(Part3・Part5と同じ考え方)を実装し、
//         sensorValueを色に変換できるようにしてください。
function intensityToColor(value: number): THREE.Color {
  throw new Error('TODO: sensorValueを色に変換してください');
}

// TODO 3: WebSocketサーバー(ws://localhost:8081)に接続し、
//         メッセージ受信時に SensorPayload をパースして
//         sensorStore.setState({ sensorValue: payload.sensorValue }) を呼んでください。
//         接続が切れた場合は、数秒後に再接続を試みる処理も入れてください。
function connectSensorSocket(): void {
  throw new Error('TODO: WebSocketに接続してください');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a12);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('app')?.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// フィボナッチ球面配置で点群を球状に均等分布させる(疑似センサーの可視化対象)
const POINT_COUNT = 2000;
const positions = new Float32Array(POINT_COUNT * 3);
for (let i = 0; i < POINT_COUNT; i++) {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / POINT_COUNT);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  const radius = 2.5;
  positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = radius * Math.cos(phi);
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
geometry.computeBoundingSphere();

const material = new THREE.PointsMaterial({ size: 0.08, color: 0x4f8fdb });
const pointCloud = new THREE.Points(geometry, material);
scene.add(pointCloud);

// TODO 4: sensorStoreを購読し、sensorValueが変化するたびに
//         intensityToColor(sensorValue)の結果を material.color に反映してください。

connectSensorSocket();

const guiState = { updateMode: 'realtime' as 'realtime' | 'paused' };
const gui = new GUI();
gui.add(guiState, 'updateMode', ['realtime', 'paused']);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate(): void {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

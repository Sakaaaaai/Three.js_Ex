import * as THREE from 'three';
import GUI from 'lil-gui';
import './style.css';

// ============================================================
// このファイルは「なんとなく動くコード」の状態です。
// ボックスが回るだけの機能はすべて実装済みで、このまま動作します。
// 演習では、このmain.tsに書かれている処理を役割ごとに分割していきます。
// 各TODOが、Q01.mdの問題文で指示するファイル分割に対応しています。
// ============================================================

// TODO 1: この一連のシーン構築処理(Scene / Camera / Light / Renderer)を
//         src/scene/createScene.ts に関数として切り出してください。
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 5;

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(3, 3, 3);
scene.add(directionalLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const appElement = document.getElementById('app');
if (appElement) {
  appElement.appendChild(renderer.domElement);
}

// TODO 2: このボックス生成処理を src/entities/RotatingBox.ts にクラスとして切り出してください。
//         - 色とサイズを後から変更できるメソッド(または仕組み)を持たせること
//         - any を使わず、Meshの型を明示すること
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: '#4f8fdb' });
const box = new THREE.Mesh(geometry, material);
scene.add(box);

// TODO 3: color / size という状態を src/state/store.ts のPub/Subストアに移してください。
//         - GUIが値を変更する → ストアが変更を通知する → entities側が購読して反映する、という流れにすること
//         - 現状はGUIがmaterialやboxを直接書き換えており、状態がどこにあるか追いづらくなっている
const params = {
  color: '#4f8fdb',
  size: 1,
};

const gui = new GUI();
gui.addColor(params, 'color').onChange((value: string) => {
  material.color.set(value);
});
gui.add(params, 'size', 0.2, 3).onChange((value: number) => {
  box.scale.setScalar(value);
});

// TODO 4: リサイズ処理を src/utils/resize.ts に切り出してください。
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate(): void {
  requestAnimationFrame(animate);
  box.rotation.x += 0.01;
  box.rotation.y += 0.01;
  renderer.render(scene, camera);
}

animate();

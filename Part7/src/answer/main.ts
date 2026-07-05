import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';
import { createGltfLoader } from './loaders/createGltfLoader';
import { measureVariant, type ModelVariant, type MeasurementResult } from './utils/measureVariant';

const variants: ModelVariant[] = [
  {
    label: '別ファイル(.gltf + .bin + PNG 512x512)',
    entryUrl: '/models/sample-separate/model.gltf',
    assetUrls: [
      '/models/sample-separate/model.gltf',
      '/models/sample-separate/model.bin',
      '/models/sample-separate/texture-large.png',
    ],
  },
  {
    label: '.glb(PNG 512x512 埋め込み)',
    entryUrl: '/models/sample-glb-large-tex/model.glb',
    assetUrls: ['/models/sample-glb-large-tex/model.glb'],
  },
  {
    label: '.glb(PNG 128x128 埋め込み)',
    entryUrl: '/models/sample-glb-small-tex/model.glb',
    assetUrls: ['/models/sample-glb-small-tex/model.glb'],
  },
];

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x12141a);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0.6, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('app')?.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.HemisphereLight(0xffffff, 0x333344, 1.2));
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(3, 3, 3);
scene.add(directionalLight);

const reportElement = document.getElementById('report');

function renderReport(results: MeasurementResult[]): void {
  if (!reportElement) return;
  const lines = results.map((result) => {
    const kb = (result.totalBytes / 1024).toFixed(1);
    return `${result.variant.label}\n  合計サイズ: ${kb} KB / 読み込み時間: ${result.loadTimeMs.toFixed(1)} ms`;
  });
  reportElement.textContent = lines.join('\n\n');
}

async function main(): Promise<void> {
  const loader = createGltfLoader(renderer);

  const results: MeasurementResult[] = [];
  for (const variant of variants) {
    const result = await measureVariant(loader, variant);
    results.push(result);
    renderReport(results);
  }

  const lastResult = results[results.length - 1];
  if (lastResult) {
    scene.add(lastResult.gltf.scene);
  }
}

main().catch((error) => {
  console.error(error);
});

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

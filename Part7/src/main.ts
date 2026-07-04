import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';

// ============================================================
// このファイルは、3種類の同じジオメトリのモデル(格納方式・テクスチャ解像度が
// 異なる)を読み込み、ファイルサイズと読み込み時間を比較するハーネスです。
//
// シーン構築・比較用データの定義はできていますが、
// 1) DRACOLoader/KTX2LoaderをセットアップしたGLTFLoaderの作成
// 2) 各モデルの読み込み時間・転送バイト数の計測
// の2箇所がTODOです。
//
// public/models/ 以下の3つのサンプルは scripts/generate-sample-assets.mjs で
// 生成した合成データです(npm run generate:assets で再生成できます)。
// 実際のDraco/KTX2圧縮ファイルを試したい場合は、Q07.mdの手順に沿って
// gltf-transform CLIで生成したファイルを public/models/ に追加し、
// 下の variants 配列にエントリを足してください。
// ============================================================

interface ModelVariant {
  label: string;
  entryUrl: string;
  // entryUrl自体に加えて、実際に転送されるファイル(.bin, テクスチャなど)も含めた一覧。
  // 単一.glbの場合はentryUrlのみでよい。
  assetUrls: string[];
}

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

interface MeasurementResult {
  variant: ModelVariant;
  gltf: GLTF;
  loadTimeMs: number;
  totalBytes: number;
}

// TODO 1: DRACOLoaderとKTX2Loaderをセットアップし、GLTFLoaderにアタッチしてください。
//         - DRACOLoader: setDecoderPath('/draco/') を指定する
//         - KTX2Loader: setTranscoderPath('/basis/') を指定し、detectSupport(renderer) を呼ぶ
//         - gltfLoader.setDRACOLoader(dracoLoader) / gltfLoader.setKTX2Loader(ktx2Loader)
function createGltfLoader(renderer: THREE.WebGLRenderer): GLTFLoader {
  throw new Error('TODO: DRACOLoader/KTX2Loaderを設定したGLTFLoaderを返してください');
}

async function fetchTotalBytes(urls: string[]): Promise<number> {
  const buffers = await Promise.all(urls.map((url) => fetch(url).then((res) => res.arrayBuffer())));
  return buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
}

// TODO 2: 指定されたvariantを読み込み、読み込み時間(ms)と転送バイト数を計測してください。
//         - performance.now() で loader.loadAsync(variant.entryUrl) の前後の時間差を取る
//         - fetchTotalBytes(variant.assetUrls) で合計バイト数を取得する
async function measureVariant(loader: GLTFLoader, variant: ModelVariant): Promise<MeasurementResult> {
  throw new Error('TODO: 読み込み時間とファイルサイズを計測してください');
}

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

  // 最後に読み込んだモデルだけをシーンに表示する
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

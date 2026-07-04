import * as THREE from 'three';
import './style.css';
import { rippleVertexShader } from './shaders/rippleVertex';
import { rippleFragmentShader } from './shaders/rippleFragment';

// ============================================================
// マウス位置の追跡・uTimeの更新など、JS/TS側の配線は実装済みです。
// 演習の本体は src/shaders/rippleVertex.ts と rippleFragment.ts の
// GLSLコード(TODO部分)です。まずはこのファイルを読んで全体の流れを
// 把握してから、シェーダーファイルのTODOを実装してください。
// ============================================================

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 2.4, 3.2);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('app')?.appendChild(renderer.domElement);

// 波紋を表現するための、細かく分割された平面
const geometry = new THREE.PlaneGeometry(4, 4, 200, 200);
geometry.rotateX(-Math.PI / 2);

const uniforms = {
  uTime: { value: 0 },
  uMouse: { value: new THREE.Vector2(0.5, 0.5) },
};

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: rippleVertexShader,
  fragmentShader: rippleFragmentShader,
  side: THREE.DoubleSide,
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

// マウス座標をレイキャストで平面上のUV座標に変換し、uMouseに渡す
const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();

window.addEventListener('pointermove', (event) => {
  pointerNdc.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointerNdc.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointerNdc, camera);
  const intersections = raycaster.intersectObject(plane);

  if (intersections.length > 0 && intersections[0].uv) {
    uniforms.uMouse.value.copy(intersections[0].uv);
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate(): void {
  requestAnimationFrame(animate);
  uniforms.uTime.value = clock.getElapsedTime();
  renderer.render(scene, camera);
}

animate();

import GUI from 'lil-gui';
import '../style.css';
import rawCsv from '../data/depth-scan.csv?raw';
import { createScene } from './scene/createScene';
import { parseDepthPoints } from './utils/parseDepthCsv';
import { DepthPointCloud } from './entities/DepthPointCloud';
import { createBloomComposer } from './postprocessing/createBloomComposer';

const appElement = document.getElementById('app');
if (!appElement) {
  throw new Error('#app element not found');
}

const { scene, camera, renderer, controls } = createScene(appElement);

const depthPoints = parseDepthPoints(rawCsv);
const pointCloud = new DepthPointCloud(depthPoints);
scene.add(pointCloud.points);

const { composer, bloomPass, setSize } = createBloomComposer(renderer, scene, camera);

const gui = new GUI();
gui.add(bloomPass, 'strength', 0, 3, 0.05);
gui.add(bloomPass, 'radius', 0, 1, 0.01);
gui.add(bloomPass, 'threshold', 0, 1, 0.01);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  setSize(window.innerWidth, window.innerHeight);
});

function animate(): void {
  requestAnimationFrame(animate);
  controls.update();
  composer.render();
}

animate();

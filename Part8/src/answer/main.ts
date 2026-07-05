import GUI from 'lil-gui';
import './style.css';
import rawCsv from './data/depth-scan.csv?raw';
import { createScene } from './scene/createScene';
import { parseDepthPoints } from './utils/parseDepthCsv';
import { HeatmapPointCloud } from './entities/HeatmapPointCloud';
import { createBloomComposer } from './postprocessing/createBloomComposer';
import { connectSensorSocket } from './utils/connectSensorSocket';
import { sensorStore } from './state/sensorStore';

const appElement = document.getElementById('app');
if (!appElement) {
  throw new Error('#app element not found');
}

const { scene, camera, renderer, controls } = createScene(appElement);

const depthPoints = parseDepthPoints(rawCsv);
const pointCloud = new HeatmapPointCloud(depthPoints);
scene.add(pointCloud.points);

const { composer, bloomPass, setSize } = createBloomComposer(renderer, scene, camera);

connectSensorSocket();

const guiState = { updateMode: 'realtime' as 'realtime' | 'paused' };
const gui = new GUI();

const bloomFolder = gui.addFolder('Bloom');
bloomFolder.add(bloomPass, 'strength', 0, 3, 0.05);
bloomFolder.add(bloomPass, 'radius', 0, 1, 0.01);
bloomFolder.add(bloomPass, 'threshold', 0, 1, 0.01);

gui.add(guiState, 'updateMode', ['realtime', 'paused']).name('sensor updates');

sensorStore.subscribe((state) => {
  if (guiState.updateMode === 'paused') return;
  pointCloud.setSensorBoost(state.sensorValue);
});

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

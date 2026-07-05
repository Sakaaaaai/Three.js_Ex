import GUI from 'lil-gui';
import './style.css';
import { createScene } from './scene/createScene';
import { SensorPointCloud } from './entities/SensorPointCloud';
import { connectSensorSocket } from './utils/connectSensorSocket';
import { sensorStore } from './state/sensorStore';

const appElement = document.getElementById('app');
if (!appElement) {
  throw new Error('#app element not found');
}

const { scene, camera, renderer, controls } = createScene(appElement);

const pointCloud = new SensorPointCloud(2000);
scene.add(pointCloud.points);

connectSensorSocket();

const guiState = { updateMode: 'realtime' as 'realtime' | 'paused' };
const gui = new GUI();
gui.add(guiState, 'updateMode', ['realtime', 'paused']);

sensorStore.subscribe((state) => {
  if (guiState.updateMode === 'paused') return;
  pointCloud.setSensorValue(state.sensorValue);
});

function animate(): void {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

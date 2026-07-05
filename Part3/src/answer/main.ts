import './style.css';
import rawCsv from './data/depth-scan.csv?raw';
import { createScene } from './scene/createScene';
import { parseDepthPoints } from './utils/parseDepthCsv';
import { DepthPointCloud } from './entities/DepthPointCloud';

const appElement = document.getElementById('app');
if (!appElement) {
  throw new Error('#app element not found');
}

const { scene, camera, renderer, controls } = createScene(appElement);

const depthPoints = parseDepthPoints(rawCsv);
const pointCloud = new DepthPointCloud(depthPoints);
scene.add(pointCloud.points);

function animate(): void {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

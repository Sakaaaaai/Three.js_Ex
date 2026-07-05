import './style.css';
import { createScene } from './scene/createScene';
import { ParticleField } from './entities/ParticleField';
import { createStatsPanel } from './utils/perf';

const appElement = document.getElementById('app');
if (!appElement) {
  throw new Error('#app element not found');
}

const { scene, camera, renderer } = createScene(appElement);
const stats = createStatsPanel();

const particleField = new ParticleField({ count: 10000, spread: 80 });
scene.add(particleField.mesh);

function animate(): void {
  stats.begin();
  requestAnimationFrame(animate);

  particleField.tick(0.002);

  renderer.render(scene, camera);
  stats.end();
}

animate();

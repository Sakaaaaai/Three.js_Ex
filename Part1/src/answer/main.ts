import GUI from 'lil-gui';
import '../style.css';
import { createScene } from './scene/createScene';
import { RotatingBox } from './entities/RotatingBox';
import { bindResize } from './utils/resize';
import { boxStore } from './state/store';

const appElement = document.getElementById('app');
if (!appElement) {
  throw new Error('#app element not found');
}

const { scene, camera, renderer } = createScene(appElement);

const box = new RotatingBox();
scene.add(box.mesh);

bindResize(camera, renderer);

// GUIはストアの値を表示・変更するだけで、Three.jsのオブジェクトを直接知らない
const guiState = { ...boxStore.getState() };
const gui = new GUI();
gui.addColor(guiState, 'color').onChange((value: string) => {
  boxStore.setState({ color: value });
});
gui.add(guiState, 'size', 0.2, 3).onChange((value: number) => {
  boxStore.setState({ size: value });
});

function animate(): void {
  requestAnimationFrame(animate);
  box.tick();
  renderer.render(scene, camera);
}

animate();

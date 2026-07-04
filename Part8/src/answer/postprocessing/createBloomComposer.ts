import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export interface BloomComposer {
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
  setSize: (width: number, height: number) => void;
}

export function createBloomComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
): BloomComposer {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.1,
    0.4,
    0.35
  );
  composer.addPass(bloomPass);

  const setSize = (width: number, height: number): void => {
    composer.setSize(width, height);
    bloomPass.setSize(width, height);
  };

  return { composer, bloomPass, setSize };
}

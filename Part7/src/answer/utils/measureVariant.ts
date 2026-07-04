import type { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface ModelVariant {
  label: string;
  entryUrl: string;
  assetUrls: string[];
}

export interface MeasurementResult {
  variant: ModelVariant;
  gltf: GLTF;
  loadTimeMs: number;
  totalBytes: number;
}

async function fetchTotalBytes(urls: string[]): Promise<number> {
  const buffers = await Promise.all(urls.map((url) => fetch(url).then((res) => res.arrayBuffer())));
  return buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
}

export async function measureVariant(
  loader: GLTFLoader,
  variant: ModelVariant
): Promise<MeasurementResult> {
  const start = performance.now();
  const gltf = await loader.loadAsync(variant.entryUrl);
  const loadTimeMs = performance.now() - start;

  const totalBytes = await fetchTotalBytes(variant.assetUrls);

  return { variant, gltf, loadTimeMs, totalBytes };
}

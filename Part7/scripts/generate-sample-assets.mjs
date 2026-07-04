// 圧縮前後比較演習のための、実際に読み込み可能なglTFアセットを生成するスクリプト。
// 外部の3Dモデルは使わず、UV球ジオメトリと疑似テクスチャをその場で生成し、
// glTF 2.0の仕様に沿って手組みでファイルを書き出している。
//
// 「格納方式(gltf+bin+png / glb)」と「テクスチャ解像度」を別々に変化させ、
// それぞれの効果を切り分けて比較できるように3種類を生成する。
//   1. public/models/sample-separate/      ... .gltf + .bin + 512x512 PNG(バラバラのファイル、3リクエスト)
//   2. public/models/sample-glb-large-tex/ ... 同じ512x512テクスチャを1つの.glbに格納(1リクエスト)
//   3. public/models/sample-glb-small-tex/ ... テクスチャを128x128に縮小した.glb(1リクエスト+軽量テクスチャ)
//
// 実行方法: node scripts/generate-sample-assets.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../public/models');

// ------------------------------------------------------------
// ジオメトリ生成(UV球。Three.jsのSphereGeometryと同じ考え方の簡易版)
// ------------------------------------------------------------
function createUvSphere(radius, widthSegments, heightSegments) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const grid = [];

  for (let iy = 0; iy <= heightSegments; iy++) {
    const verticesRow = [];
    const v = iy / heightSegments;

    for (let ix = 0; ix <= widthSegments; ix++) {
      const u = ix / widthSegments;

      const xPos = -radius * Math.cos(u * Math.PI * 2) * Math.sin(v * Math.PI);
      const yPos = radius * Math.cos(v * Math.PI);
      const zPos = radius * Math.sin(u * Math.PI * 2) * Math.sin(v * Math.PI);

      positions.push(xPos, yPos, zPos);

      const len = Math.sqrt(xPos * xPos + yPos * yPos + zPos * zPos) || 1;
      normals.push(xPos / len, yPos / len, zPos / len);

      uvs.push(u, 1 - v);

      verticesRow.push(positions.length / 3 - 1);
    }
    grid.push(verticesRow);
  }

  for (let iy = 0; iy < heightSegments; iy++) {
    for (let ix = 0; ix < widthSegments; ix++) {
      const a = grid[iy][ix + 1];
      const b = grid[iy][ix];
      const c = grid[iy + 1][ix];
      const d = grid[iy + 1][ix + 1];

      if (iy !== 0) indices.push(a, b, d);
      if (iy !== heightSegments - 1) indices.push(b, c, d);
    }
  }

  return {
    positions: Float32Array.from(positions),
    normals: Float32Array.from(normals),
    uvs: Float32Array.from(uvs),
    indices: Uint16Array.from(indices),
  };
}

// ------------------------------------------------------------
// 疑似テクスチャ生成(チェッカーボード×グラデーション)
// ------------------------------------------------------------
function createSampleTexturePng(size) {
  const png = new PNG({ width: size, height: size });

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const u = x / size;
      const v = y / size;
      const checker = (Math.floor(u * 8) + Math.floor(v * 8)) % 2;

      png.data[idx] = Math.floor(255 * u);
      png.data[idx + 1] = Math.floor(255 * v);
      png.data[idx + 2] = Math.floor(255 * (checker ? 0.85 : 0.15));
      png.data[idx + 3] = 255;
    }
  }

  return PNG.sync.write(png);
}

// ------------------------------------------------------------
// バイナリ組み立てユーティリティ
// ------------------------------------------------------------
function toBuffer(typedArray) {
  return Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
}

function alignTo4(buffer, padByte = 0) {
  const remainder = buffer.length % 4;
  if (remainder === 0) return buffer;
  return Buffer.concat([buffer, Buffer.alloc(4 - remainder, padByte)]);
}

function minMax(typedArray, itemSize) {
  const min = new Array(itemSize).fill(Infinity);
  const max = new Array(itemSize).fill(-Infinity);
  for (let i = 0; i < typedArray.length; i += itemSize) {
    for (let c = 0; c < itemSize; c++) {
      const value = typedArray[i + c];
      if (value < min[c]) min[c] = value;
      if (value > max[c]) max[c] = value;
    }
  }
  return { min, max };
}

// ------------------------------------------------------------
// glTF JSON + バッファレイアウトの構築
// ------------------------------------------------------------
function buildGltfDocument(geometry, options) {
  const { positions, normals, uvs, indices } = geometry;
  const { embedImage, imageBuffer, imageUri } = options;

  const positionsBuf = alignTo4(toBuffer(positions));
  const normalsBuf = alignTo4(toBuffer(normals));
  const uvsBuf = alignTo4(toBuffer(uvs));
  const indicesBuf = alignTo4(toBuffer(indices));

  const bufferViews = [];
  const chunks = [positionsBuf, normalsBuf, uvsBuf, indicesBuf];
  let offset = 0;
  const viewOffsets = chunks.map((chunk) => {
    const start = offset;
    offset += chunk.length;
    return start;
  });

  bufferViews.push({ buffer: 0, byteOffset: viewOffsets[0], byteLength: positionsBuf.length, target: 34962 });
  bufferViews.push({ buffer: 0, byteOffset: viewOffsets[1], byteLength: normalsBuf.length, target: 34962 });
  bufferViews.push({ buffer: 0, byteOffset: viewOffsets[2], byteLength: uvsBuf.length, target: 34962 });
  bufferViews.push({ buffer: 0, byteOffset: viewOffsets[3], byteLength: indicesBuf.length, target: 34963 });

  let binBuffer = Buffer.concat([positionsBuf, normalsBuf, uvsBuf, indicesBuf]);

  const images = [];
  const textures = [];
  if (embedImage) {
    const imageBufAligned = alignTo4(imageBuffer);
    bufferViews.push({ buffer: 0, byteOffset: binBuffer.length, byteLength: imageBufAligned.length });
    binBuffer = Buffer.concat([binBuffer, imageBufAligned]);
    images.push({ bufferView: bufferViews.length - 1, mimeType: 'image/png' });
  } else {
    images.push({ uri: imageUri });
  }
  textures.push({ source: 0 });

  const posMinMax = minMax(positions, 3);

  const accessors = [
    {
      bufferView: 0,
      componentType: 5126, // FLOAT
      count: positions.length / 3,
      type: 'VEC3',
      min: posMinMax.min,
      max: posMinMax.max,
    },
    { bufferView: 1, componentType: 5126, count: normals.length / 3, type: 'VEC3' },
    { bufferView: 2, componentType: 5126, count: uvs.length / 2, type: 'VEC2' },
    { bufferView: 3, componentType: 5123, count: indices.length, type: 'SCALAR' },
  ];

  const gltf = {
    asset: { version: '2.0', generator: 'threejs-mid-part7-sample-generator' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 },
            indices: 3,
            material: 0,
          },
        ],
      },
    ],
    materials: [
      {
        pbrMetallicRoughness: {
          baseColorTexture: { index: 0 },
          metallicFactor: 0.1,
          roughnessFactor: 0.8,
        },
      },
    ],
    textures,
    images,
    accessors,
    bufferViews,
    buffers: [{ byteLength: binBuffer.length, ...(embedImage ? {} : { uri: 'model.bin' }) }],
  };

  return { gltf, binBuffer };
}

function writeGlb(gltf, binBuffer, outPath) {
  const jsonBuffer = alignTo4(Buffer.from(JSON.stringify(gltf), 'utf-8'), 0x20);
  const binBufferAligned = alignTo4(binBuffer, 0);

  const totalLength = 12 + 8 + jsonBuffer.length + 8 + binBufferAligned.length;

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); // magic 'glTF'
  header.writeUInt32LE(2, 4); // version
  header.writeUInt32LE(totalLength, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonBuffer.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4); // 'JSON'

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binBufferAligned.length, 0);
  binChunkHeader.writeUInt32LE(0x004e4942, 4); // 'BIN\0'

  const glb = Buffer.concat([
    header,
    jsonChunkHeader,
    jsonBuffer,
    binChunkHeader,
    binBufferAligned,
  ]);

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, glb);
  return glb.length;
}

function writeSeparateFiles(gltf, binBuffer, imagePng, dir) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'model.gltf'), JSON.stringify(gltf, null, 2));
  writeFileSync(join(dir, 'model.bin'), binBuffer);
  writeFileSync(join(dir, 'texture-large.png'), imagePng);
}

// ------------------------------------------------------------
// 実行
// ------------------------------------------------------------
const geometry = createUvSphere(1, 48, 32);

const largeTexture = createSampleTexturePng(512);
const smallTexture = createSampleTexturePng(128);

// 1. baseline: 別ファイル(.gltf + .bin + 512x512 PNG)
const { gltf: separateGltf, binBuffer: separateBin } = buildGltfDocument(geometry, {
  embedImage: false,
  imageUri: 'texture-large.png',
});
writeSeparateFiles(separateGltf, separateBin, largeTexture, join(publicDir, 'sample-separate'));

// 2. 格納方式のみ変更: 同じ512x512テクスチャを1つの.glbに格納
const { gltf: glbLargeTexGltf, binBuffer: glbLargeTexBin } = buildGltfDocument(geometry, {
  embedImage: true,
  imageBuffer: largeTexture,
});
const glbLargeTexSize = writeGlb(
  glbLargeTexGltf,
  glbLargeTexBin,
  join(publicDir, 'sample-glb-large-tex/model.glb')
);

// 3. 格納方式 + テクスチャ解像度の両方を最適化: 128x128テクスチャを.glbに格納
const { gltf: glbSmallTexGltf, binBuffer: glbSmallTexBin } = buildGltfDocument(geometry, {
  embedImage: true,
  imageBuffer: smallTexture,
});
const glbSmallTexSize = writeGlb(
  glbSmallTexGltf,
  glbSmallTexBin,
  join(publicDir, 'sample-glb-small-tex/model.glb')
);

console.log('Generated sample assets:');
console.log('  1. sample-separate/      : .gltf + .bin + texture-large.png (512x512, 3 files)');
console.log(`  2. sample-glb-large-tex/ : model.glb (${glbLargeTexSize} bytes, texture 512x512, 1 file)`);
console.log(`  3. sample-glb-small-tex/ : model.glb (${glbSmallTexSize} bytes, texture 128x128, 1 file)`);

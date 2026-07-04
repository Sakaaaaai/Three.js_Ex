// Part3・Part5で使った疑似深度センサーデータの生成スクリプトと同じもの。
// 実際の研究データは使用せず、数式でそれらしい起伏を作っているだけの合成データです。
//
// 実行方法: npm run generate:data
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, '../src/data/depth-scan.csv');

const GRID_SIZE = 80;
const SPACING = 0.12;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const rows = ['x,y,z,intensity'];

for (let i = 0; i < GRID_SIZE; i++) {
  for (let j = 0; j < GRID_SIZE; j++) {
    const x = (i - GRID_SIZE / 2) * SPACING;
    const y = (j - GRID_SIZE / 2) * SPACING;

    const distanceFromCenter = Math.sqrt(x * x + y * y);
    const z = Math.sin(distanceFromCenter * 2.2) * 0.6 * Math.exp(-distanceFromCenter * 0.35);

    const noise = (Math.random() - 0.5) * 0.05;
    const intensity = clamp(0.5 + z * 0.8 + noise, 0, 1);

    rows.push(`${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)},${intensity.toFixed(4)}`);
  }
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, rows.join('\n'), 'utf-8');

console.log(`Generated ${rows.length - 1} points -> ${outputPath}`);

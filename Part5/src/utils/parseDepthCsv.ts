import Papa from 'papaparse';

export interface DepthPoint {
  x: number;
  y: number;
  z: number;
  intensity: number;
}

function isDepthPoint(row: Partial<DepthPoint>): row is DepthPoint {
  return (
    typeof row.x === 'number' &&
    typeof row.y === 'number' &&
    typeof row.z === 'number' &&
    typeof row.intensity === 'number'
  );
}

export function parseDepthPoints(csvText: string): DepthPoint[] {
  const result = Papa.parse<Partial<DepthPoint>>(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  return result.data.filter(isDepthPoint);
}

import Stats from 'stats.js';

export function createStatsPanel(): Stats {
  const stats = new Stats();
  stats.showPanel(0); // 0: FPS, 1: ms, 2: MB
  document.body.appendChild(stats.dom);
  return stats;
}

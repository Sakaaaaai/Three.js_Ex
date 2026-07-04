// 疑似センサー値を一定間隔で配信するモックWebSocketサーバー。
// 実際のセンサーの代わりに、サイン波+ノイズで0〜1の値を生成しているだけ。
//
// npm run dev で、Viteの開発サーバーと同時に自動起動します。
import { WebSocketServer } from 'ws';

const PORT = 8081;
const wss = new WebSocketServer({ port: PORT });

console.log(`Mock sensor WebSocket server listening on ws://localhost:${PORT}`);

let elapsed = 0;

function generateSensorValue() {
  elapsed += 0.15;
  const base = (Math.sin(elapsed) + 1) / 2;
  const noise = (Math.random() - 0.5) * 0.05;
  return Math.min(Math.max(base + noise, 0), 1);
}

wss.on('connection', (socket) => {
  console.log('client connected');

  const interval = setInterval(() => {
    const payload = {
      timestamp: Date.now(),
      sensorValue: generateSensorValue(),
    };
    socket.send(JSON.stringify(payload));
  }, 500);

  socket.on('close', () => {
    clearInterval(interval);
    console.log('client disconnected');
  });
});

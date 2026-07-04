import { sensorStore } from '../state/sensorStore';

const SOCKET_URL = 'ws://localhost:8081';
const RECONNECT_DELAY_MS = 2000;

interface SensorPayload {
  timestamp: number;
  sensorValue: number;
}

function isSensorPayload(value: unknown): value is SensorPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as SensorPayload).timestamp === 'number' &&
    typeof (value as SensorPayload).sensorValue === 'number'
  );
}

export function connectSensorSocket(): void {
  const socket = new WebSocket(SOCKET_URL);

  socket.addEventListener('message', (event: MessageEvent<string>) => {
    const parsed: unknown = JSON.parse(event.data);
    if (isSensorPayload(parsed)) {
      sensorStore.setState({ sensorValue: parsed.sensorValue });
    }
  });

  socket.addEventListener('close', () => {
    console.warn(`sensor socket closed, retrying in ${RECONNECT_DELAY_MS}ms...`);
    setTimeout(connectSensorSocket, RECONNECT_DELAY_MS);
  });

  socket.addEventListener('error', () => {
    socket.close();
  });
}

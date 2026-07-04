export interface SensorState {
  sensorValue: number;
}

type Listener = (state: SensorState) => void;

class SensorStore {
  private state: SensorState = { sensorValue: 0.5 };
  private listeners = new Set<Listener>();

  getState(): SensorState {
    return this.state;
  }

  setState(partial: Partial<SensorState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const sensorStore = new SensorStore();

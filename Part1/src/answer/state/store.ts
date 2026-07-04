export interface BoxState {
  color: string;
  size: number;
}

type Listener = (state: BoxState) => void;

// シンプルなPub/Subストア。
// GUIはこのストアの値を書き換えるだけで、Three.jsのオブジェクトを直接触らない。
// entities側はストアを購読し、通知が来たら自分自身を更新する。
class BoxStore {
  private state: BoxState = { color: '#4f8fdb', size: 1 };
  private listeners = new Set<Listener>();

  getState(): BoxState {
    return this.state;
  }

  setState(partial: Partial<BoxState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const boxStore = new BoxStore();

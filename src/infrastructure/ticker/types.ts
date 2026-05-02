export type TickCallback = (deltaMs: number) => void;

export type Unsubscribe = () => void;

export interface Ticker {
  subscribe(cb: TickCallback): Unsubscribe;
  dispose(): void;
}

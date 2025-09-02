import { WebSocket } from 'ws';

export interface ShellyAccessoryState {
  On: boolean;
  ws: WebSocket | null;
}

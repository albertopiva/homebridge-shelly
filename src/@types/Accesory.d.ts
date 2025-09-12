import { RPCWebSocket } from '../services/rpc/ws.js';

export interface ShellyAccessoryState {
  On: boolean;
  ws: RPCWebSocket | null;
}

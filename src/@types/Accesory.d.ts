import { RPCWebSocket } from '../services/rpc/ws';

export interface ShellyAccessoryState {
  On: boolean;
  ws: RPCWebSocket | null;
}

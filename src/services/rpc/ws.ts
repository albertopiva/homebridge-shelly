import { JSONRPC } from 'json-rpc-2.0';
import WebSocket from 'ws';
import { ShellyRPCRequest } from '../../@types/rpc/request';
import { Logging } from 'homebridge';
import {
  ShellyRPCErrorResponse,
  ShellyRPCNotificationFrame,
  ShellyRPCResponse,
} from '../../@types/rpc/response';
// import { Logger } from '../logger/logger';

export class RPCWebSocket {
  readonly LogMessage = '[RPC WS]';

  private conn: WebSocket;
  private address: string | URL;
  private id: number;
  private logger;

  constructor(address: string | URL, logger?: Logging) {
    this.conn = new WebSocket(`ws://${address}`);
    this.address = address;
    this.id = 0;
    this.logger = logger; //new Logger(logger, '[RPC WS]');
    this.logger?.debug(`WebSocket initialized to address ${this.address}`);
  }

  public open(method: string, params: object, src?: string) {
    this.conn.on('open', () => {
      // Initial state request (example for switch:0)
      const req: ShellyRPCRequest = {
        jsonrpc: JSONRPC,
        id: this.id,
        method: method,
        params: params,
        src: src || 'hb-bridge',
      };
      this.sendRequest(req);
    });
  }

  public message(
    callback?: (msg: ShellyRPCResponse | ShellyRPCNotificationFrame) => void,
  ) {
    this.conn.on('message', (msg: string) => {
      try {
        const data = JSON.parse(msg);
        this.logger?.info('Message:', msg);
        callback?.(data);
        if (data.method === 'NotifyStatus') {
          this.logger?.info('NotifyStatus:', msg);
        } else {
          this.logger?.info('Evento RPC:', data);
        }
      } catch (e) {
        this.logger?.error('Errore parsing messaggio:', e, msg);
      }
    });
  }

  public error(callback?: (error: ShellyRPCErrorResponse) => void) {
    this.conn.on('error', (error: ShellyRPCErrorResponse) => {
      callback?.(error);
      this.logger?.error(JSON.stringify(error));
    });
  }

  public close(callback?: () => void) {
    this.conn.on('close', () => {
      callback?.();
      this.logger?.warn('WebSocket closed');
    });
  }

  private sendRequest(request: ShellyRPCRequest) {
    this.id++;
    const req = JSON.stringify(request);
    this.conn.send(req);
    this.logger?.debug('Request sent:', req);
  }
}

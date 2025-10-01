import { JSONRPC } from 'json-rpc-2.0';
import WebSocket from 'ws';
import { ShellyRPCRequest } from '../../@types/rpc/request';
import { Logging } from 'homebridge';
import {
  ShellyRPCErrorResponse,
  ShellyRPCNotificationFrame,
  ShellyRPCSuccessResponse,
} from '../../@types/rpc/response';
import { Logger } from '../logger/index.js';

export class RPCWebSocket {
  readonly LogMessage = '[RPC WS]';

  private conn: WebSocket;
  private address: string | URL;
  private id: number;
  private logger;
  private src: string;

  constructor(address: string | URL, logger?: Logging, src?: string) {
    this.conn = new WebSocket(`ws://${address}/rpc`);
    this.address = address;
    this.id = 0;
    this.src = src || 'hb-bridge';
    this.logger = new Logger(logger, '[RPC WS]');
    this.logger?.debug(`WebSocket initialized to address ${this.address}`);
  }

  public open(method: string, params?: object) {
    this.conn.on('open', () => {
      // Initial state request (example for switch:0)
      const req: ShellyRPCRequest = {
        jsonrpc: JSONRPC,
        id: this.id,
        method: method,
        params: params,
        src: this.src,
      };
      this.sendRequest(req);
    });
  }

  public message(
    callback?: (
      msg: ShellyRPCSuccessResponse | ShellyRPCNotificationFrame,
    ) => void,
  ) {
    this.conn.on('message', (msg: Buffer) => {
      try {
        const data: ShellyRPCSuccessResponse | ShellyRPCNotificationFrame =
          JSON.parse(msg.toString());
        // this.logger?.info('Message:', msg.toString());
        callback?.(data);
        if ('id' in data) {
          this.id = Number(data?.id || 0) + 1;
          this.logger?.info('ResponseFrame:', msg.toString());
        } else {
          switch (data.method) {
            case 'NotifyStatus':
              this.logger?.info('NotifyStatus:', msg.toString());
              break;
            case 'NotifyEvent':
              this.logger?.info('NotifyEvent:', msg.toString());

              break;
            default:
              this.logger?.warn('Evento RPC not handled:', data.method);
          }
        }
      } catch (e) {
        this.logger?.error('Errore parsing messaggio:', e, msg.toString());
      }
    });
  }

  public error(callback?: (error: ShellyRPCErrorResponse) => void) {
    this.conn.on('error', (error: Buffer) => {
      const parsedError: ShellyRPCErrorResponse = JSON.parse(error.toString());
      callback?.(parsedError);
      this.logger?.error(JSON.stringify(parsedError));
    });
  }

  public close(callback?: () => void) {
    this.conn.on('close', () => {
      callback?.();
      this.logger?.warn('WebSocket closed');
    });
  }

  public send(method: string, params: object) {
    const req: ShellyRPCRequest = {
      id: this.id,
      jsonrpc: JSONRPC,
      method: method,
      params: params,
      src: this.src,
    };
    this.sendRequest(req);
  }

  private sendRequest(request: ShellyRPCRequest) {
    this.id++;
    const req = JSON.stringify(request);
    this.conn.send(req);
    this.logger?.debug('Request sent:', req);
  }
}

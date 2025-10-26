import { PlatformAccessory } from 'homebridge';
import { DeviceInfo } from './shelly';
import { ShellyPlatform } from '../platform';
import { RPCWebSocket } from '../services/rpc/ws';
import { Logger } from '../services/logger';

export interface SwitchConstructor {
  deviceInfo: DeviceInfo;
  deviceId: number;
  accessory: PlatformAccessory;
  platform: ShellyPlatform;
  ws: RPCWebSocket | null;
  logger: Logger;
}

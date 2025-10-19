import { ShellyModelCode } from '../@types/shelly.js';
import { ShellyModels } from '../enums/shelly.js';
import { Device, DeviceConstructor } from './base.js';
import { RPCWebSocket } from '../services/rpc/ws.js';
import {
  ShellyRPCNotificationFrame,
  ShellyRPCSuccessResponse,
} from '../@types/rpc/response.js';
import { Switch } from '../characteristics/switch.js';

export class SmartPlug extends Device {
  readonly allowedModels: ShellyModelCode[] = [
    ShellyModels.PlusPlugEU,
    ShellyModels.PlusPlugUS,
    ShellyModels.PlusPlugUS,
  ];
  // device services
  switch0: Switch;
  // Device WebSocket connection
  ws: RPCWebSocket | null = null;
  // device state
  switch0_active: boolean = false;

  constructor({ accessory, platform, deviceInfo, logger }: DeviceConstructor) {
    super({ accessory, platform, deviceInfo, logger });

    this.logger.info('Initializing SmartPlug device');

    // if (!this.allowedModels.includes(deviceInfo.model)) {
    //   throw new Error(`Unsupported model: ${deviceInfo.model}`);
    // }

    this.initWebSocket();
    this.switch0 = new Switch(
      deviceInfo,
      accessory,
      platform,
      this.ws,
      this.logger,
    );
    this.logger.info('SmartPlug handlers registered successfully');
  }

  initWebSocket() {
    this.ws = new RPCWebSocket(
      this.accessory.context.device.network_id,
      this.platform.log,
    );

    this.ws.open('Switch.GetStatus', { id: 0 });
    this.ws.message(this.handleMessage.bind(this));
    this.ws.error();
    this.ws.close();
  }

  handleMessage(
    message: ShellyRPCSuccessResponse | ShellyRPCNotificationFrame,
  ) {
    this.switch0.handleMessage(message);
  }
}

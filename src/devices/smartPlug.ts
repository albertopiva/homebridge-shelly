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
    ShellyModels.PlusPlugS,
    ShellyModels.PlusPlugSv2,
    ShellyModels.PlusPlugIT,
    ShellyModels.PlusPlugUS,
  ];
  // device services
  switch0: Switch;
  // Device WebSocket connection
  ws: RPCWebSocket | null = null;

  constructor({ accessory, platform, deviceInfo, logger }: DeviceConstructor) {
    super({ accessory, platform, deviceInfo, logger });

    this.logger.info('Initializing SmartPlug device');

    if (!this.allowedModels.includes(deviceInfo.model)) {
      throw new Error(`Unsupported model: ${deviceInfo.model}`);
    }

    this.logger.info(`Registering SmartPlug handlers ${deviceInfo.id}`);

    // initialize WebSocket connection
    this.initWebSocket();

    // initialize device service: SWITCH_0
    this.switch0 = new Switch({
      deviceInfo,
      deviceId: 0,
      accessory,
      platform,
      ws: this.ws,
      logger: this.logger,
    });

    this.logger.info('SmartPlug handlers registered successfully');
  }

  initWebSocket() {
    this.ws = new RPCWebSocket(
      this.accessory.context.device.network_id,
      this.platform.log,
    );

    this.ws.open('Shelly.GetDeviceInfo');
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

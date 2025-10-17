import type {  PlatformAccessory } from 'homebridge';

import type { ShellyPlatform } from './platform.js';
import { DeviceConfig } from './@types/config.js';
import { Logger } from './services/logger/logger.js';
import { ShellyModels } from './enums/shelly.js';
import { DeviceInfo } from './@types/shelly.js';
import { SmartPlug } from './devices/smartPlug.js';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ShellyPlatformAccessory {
  private logger: Logger;

  constructor(
    private readonly platform: ShellyPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    const shellyDevice: DeviceConfig = accessory.context.device;
    this.logger = new Logger(this.platform.log, `[${shellyDevice.name}]`);

    const response = fetch(
      `http://${shellyDevice.network_id}/rpc/Shelly.GetDeviceInfo`,
    );

    response.then((res) => {
      if (res.ok) {
        res.json().then((data: DeviceInfo) => {
          this.logger.debug(`Device Info: ${JSON.stringify(data)}`);
          switch (data.model) {
            case ShellyModels.PlusPlugIT:
            case ShellyModels.PlusPlugEU:
            case ShellyModels.PlusPlugUS:
              new SmartPlug({
                platform,
                accessory,
                deviceInfo: data,
                logger: this.platform.log,
              });
              break;
          }
        });
      }
    });
  }
}

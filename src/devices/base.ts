import { Logging, PlatformAccessory } from 'homebridge';
import { DeviceInfo } from '../@types/shelly';
import { Logger } from '../services/logger/index.js';
import { ShellyPlatform } from '../platform';

export interface DeviceConstructor {
  // Homebridge variables
  platform: ShellyPlatform;
  accessory: PlatformAccessory;
  logger: Logging;
  // Shelly variables
  deviceInfo: DeviceInfo;
}

export class Device {
  // Homebridge variables
  platform: ShellyPlatform;
  accessory: PlatformAccessory;
  logger: Logger;
  // Shelly variables
  deviceInfo: DeviceInfo;

  constructor({ platform, accessory, deviceInfo, logger }: DeviceConstructor) {
    this.platform = platform;
    this.accessory = accessory;
    this.logger = new Logger(logger, `[${accessory.context.name}]`);
    this.deviceInfo = deviceInfo;

    this.initBaseCharacteristics();
  }

  private initBaseCharacteristics() {
    // set accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Shelly');
  }
}

import type { CharacteristicValue, PlatformAccessory } from 'homebridge';

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
                // getOn: this.getOn.bind(this),
                // setOn: this.setOn.bind(this),
              });
              break;
          }
        });
      }
    });
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    this.logger.debug('EXTERNAL: Set Characteristic On ->', value);
    // implement your own code to turn your device on/off
    // this.switch0_active = value as boolean;

    // this.shellyDeviceState.ws?.send('Switch.Toggle', { id: 0 });

    // this.platform.log.debug('Set Characteristic On ->', value);
  }

  /**
     * Handle the "GET" requests from HomeKit
     * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
     *
     * GET requests should return as fast as possible. A long delay here will result in
     * HomeKit being unresponsive and a bad user experience in general.
     *
     * If your device takes time to respond you should update the status of your device
     * asynchronously instead using the `updateCharacteristic` method instead.
     * In this case, you may decide not to implement `onGet` handlers, which may speed up
     * the responsiveness of your device in the Home app.
  
     * @example
     * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
     */
  async getOn(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    // const isOn = this.switch0_active;

    this.platform.log.debug('EXTERNAL: Get Characteristic On ->', true);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // if (isOn instanceof Error) {
    //   throw new this.platform.api.hap.HapStatusError(
    //     this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE,
    //   );
    // }

    return true;
  }
}

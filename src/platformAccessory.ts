import type {
  CharacteristicValue,
  PlatformAccessory,
  Service,
} from 'homebridge';

import type { ShellyPlatform } from './platform.js';
import { DeviceConfig } from './@types/config.js';
import { ShellyAccessoryState } from './@types/Accesory.js';
import { RPCWebSocket } from './services/rpc/ws.js';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ShellyPlatformAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private shellyDeviceState: ShellyAccessoryState = {
    On: false,
    ws: null,
  };

  constructor(
    private readonly platform: ShellyPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    const shellyDevice: DeviceConfig = accessory.context.device;
    // set accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Shelly');

    // .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model'); // TODO add from device request
    // .setCharacteristic(
    //   this.platform.Characteristic.SerialNumber,
    //   'Default-Serial',
    // );

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory

    // if (accessory.context.device.CustomService) {
    //   // This is only required when using Custom Services and Characteristics not support by HomeKit
    //   this.service =
    //     this.accessory.getService(
    //       this.platform.CustomServices[accessory.context.device.CustomService],
    //     ) ||
    //     this.accessory.addService(
    //       this.platform.CustomServices[accessory.context.device.CustomService],
    //     );
    // } else {
    this.service =
      this.accessory.getService(this.platform.Service.Switch) ||
      this.accessory.addService(this.platform.Service.Switch);
    // }

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.context.device.displayName,
    );

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service
      .getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this)) // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this)); // GET - bind to the `getOn` method below

    this.platform.log.info('test:');
    this.platform.log.info(shellyDevice.network_id);
    this.platform.log.info(JSON.stringify(shellyDevice));

    this.shellyDeviceState.ws = new RPCWebSocket(
      shellyDevice.network_id,
      this.platform.log,
    );

    this.shellyDeviceState.ws.open('Switch.GetStatus', { id: 0 });
    this.shellyDeviceState.ws.message();
    this.shellyDeviceState.ws.error();
    this.shellyDeviceState.ws.close();
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    this.shellyDeviceState.On = value as boolean;

    // this.shellyDeviceState.ws?.send(
    //   JSON.stringify({
    //     id: 2,
    //     method: 'Switch.Toggle',
    //     params: { id: 0 },
    //     src: 'hb-bridge',
    //   }),
    // );

    this.platform.log.debug('Set Characteristic On ->', value);
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
    const isOn = this.shellyDeviceState.On;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return isOn;
  }
}

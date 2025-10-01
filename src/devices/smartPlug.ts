import { CharacteristicValue, Service } from 'homebridge';
import { ShellyModelCode } from '../@types/shelly';
import { ShellyModels } from '../enums/shelly';
import { Device, DeviceConstructor } from './base';
import { RPCWebSocket } from '../services/rpc/ws';

// interface SmartPlugConstructor extends DeviceConstructor {
//   // getOn: () => Promise<CharacteristicValue>;
//   // setOn: (value: CharacteristicValue) => Promise<void>;
// }

export class SmartPlug extends Device {
  readonly allowedModels: ShellyModelCode[] = [
    ShellyModels.PlusPlugEU,
    ShellyModels.PlusPlugUS,
    ShellyModels.PlusPlugUS,
  ];
  switchService: Service;
  ws: RPCWebSocket | null = null;

  switch0_active: boolean = false;

  constructor({
    accessory,
    platform,
    deviceInfo,
    logger,
    // getOn,
    // setOn,
  }: DeviceConstructor) {
    super({ accessory, platform, deviceInfo, logger });
    if (!this.allowedModels.includes(deviceInfo.model)) {
      throw new Error(`Unsupported model: ${deviceInfo.model}`);
    }

    this.switchService =
      this.accessory.getService(this.platform.Service.Switch) ||
      this.accessory.addService(this.platform.Service.Switch);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.switchService.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.context.device.name,
    );

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.switchService
      .getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this)) // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this)); // GET - bind to the `getOn` method below

    this.initWebSocket();
  }

  initWebSocket() {
    this.ws = new RPCWebSocket(
      this.accessory.context.device.network_id,
      this.platform.log,
    );

    this.ws.open('Switch.GetDeviceInfo', { id: 0 });
    this.ws.message();
    this.ws.error();
    this.ws.close();
  }

  updateSwitchState(on: boolean) {
    this.switch0_active = on;
    this.switchService
      .getCharacteristic(this.platform.Characteristic.On)
      .updateValue(on);
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    this.logger.debug('Set Characteristic On ->', value);
    // implement your own code to turn your device on/off
    this.switch0_active = value as boolean;

    // this.shellyDeviceState.ws?.send('Switch.Toggle', { id: 0 });

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
    const isOn = this.switch0_active;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // if (isOn instanceof Error) {
    //   throw new this.platform.api.hap.HapStatusError(
    //     this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE,
    //   );
    // }

    return isOn;
  }
}

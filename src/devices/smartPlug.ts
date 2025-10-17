import { CharacteristicValue, Service } from 'homebridge';
import { ShellyModelCode } from '../@types/shelly.js';
import { ShellyModels } from '../enums/shelly.js';
import { Device, DeviceConstructor } from './base.js';
import { RPCWebSocket } from '../services/rpc/ws.js';
import { ShellyRPCNotificationFrame, ShellyRPCSuccessResponse } from '../@types/rpc/response.js';

export class SmartPlug extends Device {
  readonly allowedModels: ShellyModelCode[] = [
    ShellyModels.PlusPlugEU,
    ShellyModels.PlusPlugUS,
    ShellyModels.PlusPlugUS,
  ];
  // device services
  switchService: Service;
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

    this.logger.info('SmartPlug handlers registered successfully');
    this.initWebSocket();
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

  handleMessage(message: ShellyRPCSuccessResponse | ShellyRPCNotificationFrame) {
    if ('src' in message && this.deviceInfo.id !== message.src) {
      this.logger.warn(
        `Message received from different device: ${message.src}, ignoring it.`,
      );
      return;
    }
    let newValue: boolean | null = null;
    // responseFrame
    if ('result' in message && 'output' in message.result) {
      newValue = message.result.output;
    }

    // notificationFrame
    if (
      'params' in message &&
      'switch:0' in message.params &&
      'output' in message.params['switch:0']
    ) {
      newValue = message.params['switch:0'].output as boolean;
    }

    if (newValue !== null) {
      this.updateSwitchState(newValue);
    }
  }

  updateSwitchState(on: boolean) {
    // no update needed if the value is the actual one
    if (this.switch0_active === on) {
      return;
    }

    this.logger.info('External state change ->', on);
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
    // no update needed if the value is the actual one
    if (this.switch0_active === (value as boolean)) {
      return;
    }

    this.logger.info('HomeKit set state:', value);
    // implement your own code to turn your device on/off
    this.switch0_active = value as boolean;
    this.ws?.send('Switch.Set', { id: 0, on: value });
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
    this.logger.info('HomeKit get state ->', this.switch0_active);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // if (this.switch0_active instanceof Error) {
    //   throw new this.platform.api.hap.HapStatusError(
    //     this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE,
    //   );
    // }

    return this.switch0_active;
  }
}

import { CharacteristicValue, Service } from 'homebridge';
import { ShellyPlatform } from '../platform';
import { Logger } from '../services/logger';
import { RPCWebSocket } from '../services/rpc/ws';
import {
  ShellyRPCNotificationFrame,
  ShellyRPCSuccessResponse,
} from '../@types/rpc/response';
import { DeviceInfo } from '../@types/shelly';
import { SwitchConstructor } from '../@types/switch';

export class Switch {
  private _deviceInfo: DeviceInfo;
  private _status: boolean;
  private _service: Service;
  private _logger: Logger;
  private _platform: ShellyPlatform;
  private _ws: RPCWebSocket | null = null;
  private _id: number = 1;

  constructor(params: SwitchConstructor) {
    this._deviceInfo = params.deviceInfo;
    this._id = params.deviceId;

    this._service =
      params.accessory.getService(params.platform.Service.Switch) ||
      params.accessory.addService(params.platform.Service.Switch);

    this._platform = params.platform;

    this._ws = params.ws;

    this._logger = params.logger;

    // set the service name, this is what is displayed as the default name on the Home app
    this._service.setCharacteristic(
      params.platform.Characteristic.Name,
      params.accessory.context.device.name,
    );

    this._status = false;

    // register handlers for the On/Off Characteristic
    this._service
      .getCharacteristic(this._platform.Characteristic.On)
      .onSet(this.setOn.bind(this)) // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this)); // GET - bind to the `getOn` method below

    this._ws?.send('Switch.GetStatus', { id: this._id });
  }

  handleMessage(
    message:
      | ShellyRPCSuccessResponse
      | ShellyRPCNotificationFrame<{ output: boolean; source: string }>,
  ) {
    if ('src' in message && this._deviceInfo.id !== message.src) {
      this._logger.warn(
        `[SWITCH_${this._id}] Message received from different device: ${message.src}, ignoring it.`,
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
      `switch:${this._id}` in message.params &&
      'output' in message.params[`switch:${this._id}`]
    ) {
      newValue = message.params[`switch:${this._id}`]?.output;
    }

    if (newValue !== null) {
      this.updateSwitchState(newValue);
    }
  }

  updateSwitchState(on: boolean) {
    // no update needed if the value is the actual one
    if (this._status === on) {
      return;
    }

    this._logger.info(`[SWITCH_${this._id}] External state change ->`, on);
    this._status = on;
    this._service
      .getCharacteristic(this._platform.Characteristic.On)
      .updateValue(on);
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    // no update needed if the value is the actual one
    if (this._status === (value as boolean)) {
      return;
    }

    this._logger.info(`[SWITCH_${this._id}] HomeKit set state:`, value);
    // implement your own code to turn your device on/off
    this._status = value as boolean;
    this._ws?.send('Switch.Set', { id: 0, on: value });
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
    this._logger.info(
      `[SWITCH_${this._id}] HomeKit get state ->`,
      this._status,
    );

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // if (this.switch0_active instanceof Error) {
    //   throw new this.platform.api.hap.HapStatusError(
    //     this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE,
    //   );
    // }

    return this._status;
  }
}

import { PlatformConfig } from 'homebridge';

export interface DeviceConfig {
  /**
   * Device identifier
   */
  id: string;
  name?: string;
  /**
   * IP or hostname
   */
  network_id: string;
  /**
   * Device password, if any
   */
  password?: string;
  /**
   * Exclude this device from being controlled by Homebridge
   */
  exclude?: boolean;
}

/**
 * UserConfig represents the user configuration for the Homebridge Shelly plugin.
 * It defines the structure of the configuration object that users can customize.
 */
export interface UserConfig extends PlatformConfig {
  name: string;
  devices: DeviceConfig[];
}

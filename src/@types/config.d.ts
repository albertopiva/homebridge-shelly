import { PlatformConfig } from 'homebridge';

export interface DeviceConfig {
  id: string;
  name?: string;
  /**
   * IP or hostname
   */
  network_id: string;
  password?: string;
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

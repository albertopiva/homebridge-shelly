import { ShellyModels } from '../enums/shelly';

export type ShellyModelCode = (typeof ShellyModels)[keyof typeof ShellyModels];

export interface DeviceInfo {
  name: string | null;
  id: string;
  mac: string;
  slot: number;
  model: ShellyModelCode;
  gen: number;
  fw_id: string;
  ver: string;
  app: string;
  auth_en: boolean;
  auth_domain: string | null;
}

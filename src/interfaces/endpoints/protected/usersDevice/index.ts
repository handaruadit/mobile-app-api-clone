import { IUsersDeviceSettingEntity } from '@/interfaces/entities';
import { DeviceDarkModeSettings } from '@/lib/enum';

export interface InputProtectedDeviceParams {
  id?: string;
}

export interface InputProtectedDeviceUpdateBody {
  name?: string;
  fcmToken?: string;
  platform?: string;
  versionName?: string;
  systemName?: string;
  buildNumber?: string;
  location?: {
    ip: string;
    country: string
    city?: string;
    state?: string;
    coordinates?: {
      longitude?: number;
      latitude?: number;
    }
  }
  setting?: {
    geolocation?: boolean;
    notifications?: boolean;
    darkMode?: DeviceDarkModeSettings;
    time24?: boolean;
    language?: string;
  };
}

export interface OutputProtectedDeviceRead {
  device: { setting: IUsersDeviceSettingEntity };
}

export interface OutputProtectedDeviceUpdate {
  device: { setting: IUsersDeviceSettingEntity };
}

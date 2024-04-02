import { DeviceDarkModeSettings, IBaseUserEntity } from '@/types';

// LIST
export interface OutputProtectedUserList {
  user: IBaseUserEntity;
}

// PUT
export interface InputProtectedUserPutBody {
  email: string;
  name?: string;
  job?: string;
  password?: string;
  phoneNumber?: string;
  hasWhatsapp?: boolean;
  setting?: {
    geolocation?: boolean;
    notifications?: boolean;
    darkMode?: DeviceDarkModeSettings;
    time24?: boolean;
    language?: string;
  }
}
export interface OutputProtectedUserPut {
  user: IBaseUserEntity;
}

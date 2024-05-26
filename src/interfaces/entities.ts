import { Types } from 'mongoose';

import { DeviceDarkModeSettings, IOutputWorkspacePermission, ReturnCodes } from '@/types';

// USER
export interface IUserMinimalModel {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
}

export interface IBaseUserEntity {
  _id: Types.ObjectId | string;
  name?: string;
  email: string;
  password: string;
  job?: string;
  phoneNumber?: string;
  hasWhatsapp?: boolean;
  setting?: {
    geolocation: boolean;
    notifications: boolean;
    darkMode: DeviceDarkModeSettings;
    time24: boolean;
    language: string;
  }
}

export interface IAdminDeleteOutput {
  code: ReturnCodes;
};

export interface IUsersDeviceSettingEntity {
  geolocation?: boolean;
  notifications?: boolean;
  darkMode?: DeviceDarkModeSettings;
  time24?: boolean;
  language?: string;
}


// interface ICompanyOwner {
//   _id?: Types.ObjectId | string;
//   name?: string;
//   email?: string;
// }
export interface IOutputWorkspaceMember {
  id?: Types.ObjectId | string;
  permissions?: IOutputWorkspacePermission[];
}
export interface IOutputWorkspaceMemberPopulated {
  _id?: Types.ObjectId | string;
  permissions?: IOutputWorkspacePermission[];
  name?: string;
  email: string;
}

// COMPANY
export interface IProtectedCompanyEntity {
  _id: Types.ObjectId | string;
  industry?: string;
  ownerId?: Types.ObjectId | string;
  createdAt: NativeDate | string;
  updatedAt: NativeDate | string;
}

// INVITATION
export interface IOutputWorkspaceInvitation {
  _id: Types.ObjectId | string;
  userEmail: string;
  workspaceId: Types.ObjectId | string;
  permissions: IOutputWorkspacePermission[];
  token: string;
  expireAt: NativeDate | string;
  createdAt: NativeDate | string;
  updatedAt: NativeDate | string;
}

export interface IOutputDevice {
  name: string;
  description?: string;
  isDefault: boolean;
  brand?: string;
  plantedAt?: NativeDate | string;
  company?: Types.ObjectId | string;
  workspace?: Types.ObjectId | string;
  maxPowerOutput?: number;
  batteryCapacity?: number;
  panelSize?: number;
  totalPanel?: number;
  efficiencyRating?: number;
  votageOutput?: number;
  material?: string;
  warrantyExpiration?: NativeDate | string;
  inverterType?: string;
  weatherResistanceRating?: string;
};

// WORKSPACE
export interface IOutputWorkspace {
  _id: Types.ObjectId | string;
  name?: string;
  language?: string;
  timezone?: string;
  ownerId?: Types.ObjectId | string;
  members?: IOutputWorkspaceMember[];
  userAvgDailyConsumption?: number; 
  calculatedAvgDailyConsumption?: number;
  avgSunlightPerDay?: number;
  plnPricePerKwh?: number;
  coordinates?: {
    latitude?: number;
    longitude?: number;
    elevation?: number;
  };
  location?: {
    type?: string;
    coordinates?: [number, number];
  };
  createdAt?: NativeDate | string;
  updatedAt?: NativeDate | string;
  devices?: IOutputDevice[];
}

export interface IOutputWorkspacePopulated extends IOutputWorkspace {
  _owners?: IUserMinimalModel;
  _members?: IUserMinimalModel[];
  invitations: IOutputWorkspaceInvitation[];
}

export interface IOutputWorkspaceList extends IOutputWorkspace  {
  invitationCount?: number;
  deviceCount?: number;
  totalPanelCapacity?: number;
}

export interface IProtectedInverterData {
  sentAt: Date | string;
  createdAt: Date | string; // also means received at
  isOnline?: boolean;
  deviceId?: Types.ObjectId | string;
  metadata?: any;
  panelVoltage?: number;
  batteryVoltage?: number;
  panelCurrent?: number;
  batteryCurrent?: number;
  panelPower?: number;
  batteryPower?: number;
}
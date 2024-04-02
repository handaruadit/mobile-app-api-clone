import { IOutputDevice, ReturnCodes } from "@/types";

export interface IProtectedPostDeviceBody {
  name: string;
  description?: string;
  isDefault: boolean;
  brand?: string;
  plantedAt?: Date | string;
  company?: string;
  workspace: string;
}

export interface IProtectedListDeviceOutput {
  data: IOutputDevice[];
  offset?: number;
  page?: number;
  limit: number;
  total: number;
}

export interface IProtectedPairDeviceOutput {
  code: ReturnCodes;
}
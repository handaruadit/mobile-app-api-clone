import { IOutputDevice } from "@/types";

export interface IAdminPostDeviceBody {
  name: string;
  description?: string;
  isDefault: boolean;
  brand?: string;
  plantedAt?: Date | string;
  company?: string;
  workspace: string;
  maxPowerOutput?: number;
  batteryCapacity?: number;
  panelSize?: number;
  totalPanel?: number;
  efficiencyRating?: number;
  votageOutput?: number;
  material?: string;
  warrantyExpiration?: Date | string;
  inverterType?: string;
  weatherResistanceRating?: string;
}

export interface IAdminListDeviceOutput {
  data: IOutputDevice[];
  offset?: number;
  page?: number;
  limit: number;
  total: number;
}
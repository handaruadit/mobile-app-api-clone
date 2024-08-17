import { IOutputWorkspace, IOutputWorkspacePermission } from '@/types';

export interface IAdminPostWorkspaceBody {
  name: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
    elevation?: number;
  };
  location?: {
    type?: string;
    coordinates?: [number, number];
  };
  userAvgDailyConsumption?: number;
  calculatedAvgDailyConsumption?: number;
  avgSunlightPerDay?: number;
  language?: string;
  timezone?: string;
  ownerId: string;
  members?: {
    id?: string;
    permissions?: IOutputWorkspacePermission[];
  }[];
}

export interface IAdminListWorkspaceOutput {
  data: IOutputWorkspace[];
  offset?: number;
  page?: number;
  limit: number;
  total: number;
}

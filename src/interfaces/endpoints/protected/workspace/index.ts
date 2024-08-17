import { IOutputWorkspacePopulated, IOutputWorkspaceList, IOutputWorkspace } from '@/interfaces/entities';
import { ReturnCodes } from '@/lib/enum';
import { IOutputWorkspacePermission } from '@/types';

// LIST
export interface OutputProtectedWorkspaceList {
  workspaces: IOutputWorkspaceList[];
}

// GET
export interface OutputProtectedWorkspaceGet {
  workspace: IOutputWorkspacePopulated;
}

// POST
export interface InputProtectedWorkspacePostBody {
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
  language?: string;
  timezone?: string;
  userAvgDailyConsumption?: number;
  avgSunlightPerDay?: number;
  plnPricePerKwh?: number;
  members?: {
    id?: string;
    permissions?: IOutputWorkspacePermission[];
  }[];
}

export interface InputProtectedWorkspacePutBody extends InputProtectedWorkspacePostBody {
  ownerId?: string;
}

export interface OutputProtectedWorkspacePost {
  workspace: IOutputWorkspace;
}

export interface OutputProtectedWorkspacePut {
  workspace: IOutputWorkspace;
}

// DELETE
export interface OutputProtectedWorkspaceDelete {
  code: ReturnCodes;
}

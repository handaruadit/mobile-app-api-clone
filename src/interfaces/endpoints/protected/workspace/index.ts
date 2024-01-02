import {
  IOutputWorkspace,
  IOutputWorkspacePopulated,
  IOutputWorkspaceList
} from '@/interfaces/entities';
import { ReturnCodes } from '@/lib/enum';

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
  language: string;
  timezone: string;
}

export interface OutputProtectedWorkspacePost {
  workspace: IOutputWorkspace;
}

// PUT
export interface InputProtectedWorkspacePutBody {
  name?: string;
  language?: string;
  timezone?: string;
}

export interface OutputProtectedWorkspacePut {
  workspace: IOutputWorkspace;
}

// DELETE
export interface OutputProtectedWorkspaceDelete {
  code: ReturnCodes;
}

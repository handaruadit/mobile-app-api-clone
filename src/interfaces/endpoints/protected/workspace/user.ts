import { ReturnCodes } from '@/lib/enum';

// POST
export interface InputProtectedWorkspaceUserPostBody {
  email: string;
  workspaceId: string;
  permissions: [{ entity: string; role: string }];
}
export interface OutputProtectedWorkspaceUserPost {
  code: ReturnCodes;
}

// PUT
export interface InputProtectedWorkspaceUserPutBody {
  workspaceId?: string;
  permissions?: [{ entity: string; role: string }];
}
export interface OutputProtectedWorkspaceUserPut {
  code: ReturnCodes;
}

// DELETE
export interface InputProtectedWorkspaceUserDeleteBody {
  workspaceId: string;
}
export interface OutputProtectedWorkspaceUserDelete {
  code: ReturnCodes;
}

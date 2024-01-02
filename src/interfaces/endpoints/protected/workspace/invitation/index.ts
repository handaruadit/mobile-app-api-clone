import { IOutputWorkspaceInvitation } from '@/interfaces/entities';
import { ReturnCodes } from '@/lib/enum';

// LIST
export interface OutputProtectedWorkspaceInvitationList {
  tokens: IOutputWorkspaceInvitation[];
}

// PUT
export interface InputProtectedWorkspaceInvitationPutBody {
  permissions: [{ entity: string; role: string }];
}

export interface OutputProtectedWorkspaceInvitationPut {
  code: ReturnCodes;
}

// DELETE
export interface OutputProtectedWorkspaceInvitationDelete {
  code: ReturnCodes;
}

import { ReturnCodes } from '@/lib/enum';

// PUT
export interface InputProtectedWorkspaceOwnershipPutBody {
  userId: string;
}

export interface OutputProtectedWorkspaceOwnershipPut {
  code: ReturnCodes;
}

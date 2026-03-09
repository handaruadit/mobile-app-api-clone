import { OutputTokens } from '@/interfaces/output';

// PUT
export interface InputProtectedWorkspaceSwitchUserPutBody {
  newOwnerId: string;
}

export interface OutputProtectedWorkspaceSwitchPut {
  tokens: OutputTokens;
}

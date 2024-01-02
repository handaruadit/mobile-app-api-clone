import { Entities, ErrorCodes, Roles } from '@/lib/enum';

export interface OutputTokens {
  accessToken: string;
  refreshToken: string;
}

export interface OutputError {
  error: {
    code: ErrorCodes;
    payload?: any;
  };
}

export interface JWTDecodedOutput {
  iss?: string;
  id: string;
  email: string;
  company?: {
    id: string;
    owner: boolean;
  };
  workspace?: {
    id: string;
    owner: boolean;
  };
  permissions?: Record<string, string>[];
}

export interface IOutputWorkspacePermission {
  entity?: Entities;
  role?: Roles;
}

import { OutputTokens } from '@/interfaces/output';

// POST
export interface OutputProtectedRefreshPost {
  tokens: OutputTokens;
}

export interface IPublicRefreshPayload {
  ip: string;
  name?: string;
  versionName?: string;
  fcmToken?: string;
}

export interface OutputPublicRefreshCreate {
  accessToken: string; // containes uuid and follwing as empty array
  refreshToken: string; // contains uuid and expires after 7 days
}

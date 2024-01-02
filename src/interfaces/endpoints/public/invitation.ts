import { OutputTokens } from '@/interfaces/output';

// GET
export interface OutputPublicInvitationGet {
  userEmail?: string;
  company?: string;
  workspace?: string;
}

// POST
export interface InputPublicInvitationPostBody {
  name: string;
  token: string;
  password: string;
}
export interface OutputPublicInvitationPost {
  tokens: OutputTokens;
}

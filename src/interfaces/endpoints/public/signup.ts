import { OutputTokens } from '@/interfaces/output';

// POST
export interface InputPublicSignupPostBody {
  email: string;
  password: string;
  name: string;
}
export interface OutputPublicSignupPost {
  tokens: OutputTokens;
}

import { OutputTokens } from '@/interfaces/output';

// POST
export interface InputPublicLoginPostBody {
  email: string;
  password: string;
}
export interface OutputPublicLoginPost {
  tokens: OutputTokens;
}

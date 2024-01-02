import { ReturnCodes } from '@/lib/enum';

// POST
export interface InputPublicForgotPostBody {
  email: string;
}
export interface OutputPublicForgotPost {
  code: ReturnCodes;
}

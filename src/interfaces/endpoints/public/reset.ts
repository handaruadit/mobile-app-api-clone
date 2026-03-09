import { ReturnCodes } from '@/lib/enum';

// GET
export type OutputPublicResetGet = {
  token: {
    token?: string;
    expireAt: Date;
  };
};

// POST
export interface InputPublicResetPostBody {
  token: string;
  password: string;
}
export interface OutputPublicResetPost {
  code: ReturnCodes;
}

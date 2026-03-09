import { JWTDecodedOutput } from '@/interfaces/output';
import { IUserModelWithId } from '@/models/user';

interface ExpressAccount extends IUserModelWithId {
  companyId?: string;
  workspaceId?: string;
}

declare global {
  namespace Express {
    export interface Request {
      account: ExpressAccount;
      jwt: JWTDecodedOutput;
      body: Record<string, string>;
    }
  }
}

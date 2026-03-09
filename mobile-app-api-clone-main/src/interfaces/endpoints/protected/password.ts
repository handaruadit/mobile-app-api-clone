import { IBaseUserEntity } from '@/interfaces/entities';

// PUT
export interface InputProtectedPasswordPutBody {
  password: string;
  newPassword: string;
}
export interface OutputProtectedPasswordPut {
  user: IBaseUserEntity;
}

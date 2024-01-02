import { Departments, IProtectedUserEntity } from '@/types';

// LIST
export interface OutputProtectedUserList {
  user: IProtectedUserEntity;
}

// PUT
export interface InputProtectedUserPutBody {
  email: string;
  name?: string;
  job?: string;
  department?: Departments;
}
export interface OutputProtectedUserPut {
  user: IProtectedUserEntity;
}

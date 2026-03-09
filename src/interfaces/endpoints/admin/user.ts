import { IBaseUserEntity, ReturnCodes } from '@/types';

export type IAdminPostUserOutput = IBaseUserEntity;
export interface IAdminListUserOutput {
  data: IBaseUserEntity[];
  offset?: number;
  page?: number;
  limit: number;
  total: number;
}

export type IAdminPutUserOutput = IBaseUserEntity;
export type IAdminReadUserOutput = IBaseUserEntity;
export interface IAdminDeleteUserOutput {
  code: ReturnCodes;
}

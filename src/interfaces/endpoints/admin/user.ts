import { IBaseUserEntity, ReturnCodes } from '@/types';

export interface IAdminPostUserOutput extends IBaseUserEntity {};
export interface IAdminListUserOutput {
  data: IBaseUserEntity[];
  offset?: number;
  page?: number;
  limit: number;
  total: number;
}

export interface IAdminPutUserOutput extends IBaseUserEntity {};
export interface IAdminReadUserOutput extends IBaseUserEntity {};
export interface IAdminDeleteUserOutput {
  code: ReturnCodes
};

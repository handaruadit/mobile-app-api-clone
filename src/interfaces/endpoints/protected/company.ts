import { IProtectedCompanyEntity } from '@/types';

import { ReturnCodes } from '@/lib/enum';

// LIST
export interface OutputProtectedCompanyList {
  company: IProtectedCompanyEntity;
}

// POST
export interface InputProtectedCompanyPostBody {
  name: string;
  company: string;
  industry: string;
}
export interface OutputProtectedCompanyPost {
  company: IProtectedCompanyEntity;
}

// PUT
export interface InputProtectedCompanyPutBody {
  name?: string;
  company?: string;
  industry?: string;
}
export interface OutputProtectedCompanyPut {
  company: IProtectedCompanyEntity;
}

// DELETE
export interface OutputProtectedCompanyDelete {
  code: ReturnCodes;
}

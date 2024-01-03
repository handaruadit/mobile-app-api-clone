import { Types } from 'mongoose';

import { Departments, IOutputWorkspacePermission } from '@/types';

// USER
export interface IProtectedUserEntity {
  _id: Types.ObjectId | string;
  name?: string;
  email?: string;
  createdAt: NativeDate | string;
  updatedAt: NativeDate | string;
  job?: string;
  department?: Departments;
}
interface ICompanyOwner {
  _id?: Types.ObjectId | string;
  name?: string;
  email?: string;
}
export interface IOutputWorkspaceMember {
  id?: Types.ObjectId | string;
  permissions?: IOutputWorkspacePermission[];
}
export interface IOutputWorkspaceMemberPopulated {
  _id?: Types.ObjectId | string;
  permissions?: IOutputWorkspacePermission[];
  name?: string;
  email: string;
}

// COMPANY
export interface IProtectedCompanyEntity {
  _id: Types.ObjectId | string;
  industry?: string;
  ownerId?: Types.ObjectId | string;
  createdAt: NativeDate | string;
  updatedAt: NativeDate | string;
}

// INVITATION
export interface IOutputWorkspaceInvitation {
  _id: Types.ObjectId | string;
  userEmail: string;
  workspaceId: Types.ObjectId | string;
  permissions: IOutputWorkspacePermission[];
  token: string;
  expireAt: NativeDate | string;
  createdAt: NativeDate | string;
  updatedAt: NativeDate | string;
}

// WORKSPACE
export interface IOutputWorkspace {
  _id: Types.ObjectId | string;
  name: string;
  isDefault: boolean;
  language: string;
  timezone: string;
  ownerId: Types.ObjectId | string;
  companyId: Types.ObjectId | string;
  members: IOutputWorkspaceMember[];
  createdAt: NativeDate | string;
  updatedAt: NativeDate | string;
}

export interface IOutputWorkspacePopulated {
  _id: Types.ObjectId | string;
  name: string;
  isDefault: boolean;
  language: string;
  timezone: string;
  ownerId: Types.ObjectId | string;
  companyId: Types.ObjectId | string;
  members: IOutputWorkspaceMember[];
  createdAt: NativeDate | string;
  updatedAt: NativeDate | string;
  _owner: ICompanyOwner;
  _companyOwner: ICompanyOwner;
  _members: IOutputWorkspaceMemberPopulated[];
  invitations: IOutputWorkspaceInvitation[];
}

export interface IOutputWorkspaceList {
  _id: Types.ObjectId | string;
  name: string;
  isDefault: boolean;
  language: string;
  timezone: string;
  ownerId: Types.ObjectId | string;
  companyId: Types.ObjectId | string;
  members: IOutputWorkspaceMember[];
  createdAt: NativeDate | string;
  updatedAt: NativeDate | string;
  invitationCount?: number;
  companyName: string;
}

import { Request, Response } from 'express';

export type PermissionItem = {
  entity?: string;
  permissions?: string[];
  onlyCompanyOwner?: boolean;
  onlyWorkspaceOwner?: boolean;
};

export type RoutePermissions = {
  list?: PermissionItem;
  read?: PermissionItem;
  post?: PermissionItem;
  put?: PermissionItem;
  patch?: PermissionItem;
  delete?: PermissionItem;
};

export type RouteMethod = (req: Request, res: Response) => void;

export interface IRoute {
  id?: string;
  middleware?: (string | RegExp | any)[];
  permissions?: RoutePermissions;
  list?: RouteMethod;
  read?: RouteMethod;
  post?: RouteMethod;
  put?: RouteMethod;
  patch?: RouteMethod;
  delete?: RouteMethod;
}

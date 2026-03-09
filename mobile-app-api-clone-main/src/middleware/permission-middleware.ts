import { NextFunction, Request, Response } from 'express';

import { RoutePermissions, PermissionItem } from '@/interfaces/route';
import Exception from '@/lib/exception';
import { checkJWTPermissions } from '@/lib/permission';

export default (routePermissions: RoutePermissions) => (req: Request, res: Response, next: NextFunction) => {
  if (!routePermissions) {
    next();
    return;
  }

  let key = req.method.toLowerCase();

  if (key === 'get') {
    key = Object.values(req.params).length === 0 ? 'list' : 'read';
  }

  const selectedRoutePermissions = routePermissions[key as keyof RoutePermissions] as PermissionItem;
  if (selectedRoutePermissions) {
    const { entity, permissions, onlyWorkspaceOwner } = selectedRoutePermissions;
    const hasPermission = checkJWTPermissions({
      jwt: req.jwt,
      entity,
      permissions,
      onlyWorkspaceOwner
    });

    if (!hasPermission) {
      Exception.unauthorized(res);
      return;
    }
  }

  next();
};

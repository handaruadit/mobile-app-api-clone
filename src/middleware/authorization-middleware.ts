import { NextFunction, Request, Response } from 'express';

import { isAdmin, isTokenValid } from '@/lib/authorization';
import Exception from '@/lib/exception';

export default async (req: Request, res: Response, next: NextFunction) => {
  const isAdminProtected = req.url.indexOf('/admin/') !== -1;
  const isRunner = req.url.indexOf('/runner/') !== -1;
  const isProtected = req.url.indexOf('/protected/') !== -1;
  const isRefreshTokenPath = req.url.indexOf('/protected/refresh') !== -1;

  if (isAdminProtected) {
    const [isUserAdmin, account] = await isAdmin(req.headers);

    if (!isUserAdmin || !account) {
      Exception.unauthorized(res);
      return;
    }
    req.account = account;
  } else if (isRefreshTokenPath) {
    try {
      console.log("REFRESHING")
      const { account, jwt } =
        (await isTokenValid(req.headers, 'refresh')) ?? {};

      if (!account || !jwt) {
        Exception.unauthorized(res);
        return;
      }
      req.account = account;
    } catch (error: any) {
      Exception.unauthorized(res);
      return;
    }
  } else if (isProtected) {
    try {
      const { account, jwt } =
        (await isTokenValid(req.headers, 'access')) ?? {};

      if (!account || !jwt) {
        Exception.unauthorized(res);
        return;
      }

      req.account = account;
      req.jwt = jwt;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorName: string =
        error.name === 'TokenExpiredError' ? error.name : undefined;
      Exception.unauthorized(res, errorName);
      return;
    }
  } else if (isRunner) {
    const isRunner = req.headers['x-runner'];

    if (!isRunner) {
      Exception.unauthorized(res);
      return;
    }
  }
  next();
  return;
};

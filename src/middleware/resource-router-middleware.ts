import { Router } from 'express';

import { IRoute } from '@/interfaces/route';
import Exception from '@/lib/exception';

import permissionMiddleware from './permission-middleware';

const methodsWithId = ['read', 'put', 'patch', 'delete'];
const map = {
  list: 'get',
  read: 'get',
  post: 'post',
  put: 'put',
  patch: 'patch',
  delete: 'delete'
};

const resource = (route: IRoute) => {
  const router = Router({ mergeParams: true });

  route.id = route.id ?? 'id';

  if (route.middleware) {
    router.use(route.middleware);
  }

  if (route.permissions !== undefined) {
    router.use(permissionMiddleware(route.permissions));
  }

  for (const key in route) {
    const fn = map[key as keyof typeof map] ?? key;

    if (typeof router[fn as keyof typeof router] === 'function') {
      const url = methodsWithId.includes(key) ? '/:' + route.id : '/';

      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      router[fn](url, (req, res, next) => {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return route[key](req, res, next)?.catch((error: unknown) => {
          Exception.parseError(res, error);
          return;
        });
      });
    }
  }

  return router;
};

export default resource;

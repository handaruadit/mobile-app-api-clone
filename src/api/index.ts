import { Router } from 'express';
import mongoose from 'mongoose';
import requireDir from 'require-dir';

import { version } from '../../package.json';
import { IConfig } from '@/config';
import RedisCache from '@/lib/redisCache';

const publicPaths = requireDir('./public', { recurse: true, duplicates: true });
const protectedPaths = requireDir('./protected', {
  recurse: true,
  duplicates: true
});
const runnerPaths = requireDir('./runner', { recurse: true, duplicates: true });
const adminPaths = requireDir('./admin', { recurse: true, duplicates: true });

export interface IRouteParams {
  client: RedisCache;
  config: IConfig;
  db: mongoose.Connection;
}

const requireFile = (
  prefix: string,
  paths: { [path: string]: any },
  api: Router,
  params: IRouteParams
) => {
  const sortedPaths = Object.fromEntries(
    Object.entries(paths).sort(([v1]) => (v1 === 'index' ? 1 : -1))
  );

  Object.entries(sortedPaths).forEach(([key, file]) => {
    if (file.default) {
      if (key?.includes('.ts') || key?.includes('.js')) {
        const endpoint = `/${prefix}/${key
          .replace('.js', '')
          .replace('.ts', '')
          .replace('index', '')}`;
        console.log(endpoint);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        api.use(endpoint, file.default(params));
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      requireFile(`${prefix}/${key}`, file, api, params);
    }
  });
};

export default ({ config, client, db }: IRouteParams) => {
  const api = Router();
  const params = { config, client, db };

  // Public end-points
  if (process.env.AVAILABLE_PATHS?.includes('public')) {
    requireFile('public', publicPaths, api, params);
  }

  // Protected end-points
  if (process.env.AVAILABLE_PATHS?.includes('protected')) {
    requireFile('protected', protectedPaths, api, params);
  }

  // Admin end-points
  if (process.env.AVAILABLE_PATHS?.includes('runner')) {
    requireFile('runner', runnerPaths, api, params);
  }

  // Admin end-points
  if (process.env.AVAILABLE_PATHS?.includes('admin')) {
    requireFile('admin', adminPaths, api, params);
  }

  process.env.AVAILABLE_PATHS?.split(',').forEach((path) => {
    api.get(`/${path}/`, (req, res) => {
      res.json({ version });
    });
  });

  api.get('/', (req, res) => {
    res.json({ version });
  });

  return api;
};

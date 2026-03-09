import { Request } from 'express';

import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    post: ({ body }: Request & { body: any }, res) => {
      try {
        if (!body) {
          return Exception.notValid(res);
        }
        res.json({ ok: true } satisfies { ok: boolean });
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    list: ({ query }: Request, res) => {
      try {
        if (!query) {
          return Exception.notValid(res);
        }
        res.json({ ok: true } satisfies { ok: boolean });
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    read: ({ query, params }: Request, res) => {
      try {
        if (!query || !params) {
          return Exception.notValid(res);
        }
        res.json({ ok: true } satisfies { ok: boolean });
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    put: ({ body, params }: Request & { body: any }, res) => {
      try {
        if (!body || !params) {
          return Exception.notValid(res);
        }
        res.json({ ok: true } satisfies { ok: boolean });
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    delete: ({ params }: Request, res) => {
      try {
        if (!params) {
          return Exception.notValid(res);
        }
        res.json({ ok: true } satisfies { ok: boolean });
      } catch (error) {
        Exception.parseError(res, error);
      }
    }
  });

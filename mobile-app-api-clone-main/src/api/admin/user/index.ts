import { Request } from 'express';
import isEmail from 'validator/lib/isEmail';
import isLength from 'validator/lib/isLength';

import { user as entity } from '@/models';
import { IUserModelPayload, IUserModelWithId } from '@/models/user';

import { ErrorCodes, ReturnCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';
import {
  IAdminDeleteUserOutput,
  IAdminListUserOutput,
  IAdminPostUserOutput,
  IAdminPutUserOutput,
  IAdminReadUserOutput
} from '@/interfaces/endpoints/admin/user';
import { isInvalidPaginateParams } from '@/lib/util';
import { encryptPassword } from '@/lib/encode';

export default () =>
  resource({
    post: async ({ body }: Request & { body: IUserModelPayload }, res) => {
      try {
        const { email, password } = body as IUserModelPayload;
        const valid = isEmail(email) && isLength(password, { min: 6 });

        if (!valid) {
          Exception.notValid(res);
          return;
        }

        const [existingUser] = await entity.find<IUserModelWithId>({
          email
        });

        if (existingUser) {
          Exception.notValid(res, ErrorCodes.USER_ALREADY_EXISTS);
          return;
        }
        const created = await entity.create<IUserModelWithId>(body);

        res.json(created satisfies IAdminPostUserOutput);
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    list: async ({ query }: Request, res) => {
      try {
        const { offset, page = 1 } = query;
        const limit = 10;

        if (isInvalidPaginateParams(Number(offset), Number(page), Number(limit))) {
          Exception.notValid(res, ErrorCodes.INVALID_REQUEST as string);
          return;
        }

        if (!query) {
          return Exception.notValid(res);
        }
        const [total, users] = await entity.paginatedFind<IUserModelWithId>({}, 'createdAt', 'descending', limit, true);

        res.json({
          data: users,
          offset: Number(offset),
          page: !offset ? Number(page) : undefined,
          limit: Number(limit),
          total
        } satisfies IAdminListUserOutput);
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    read: async ({ params }: Request, res) => {
      try {
        if (!params?.id) {
          return Exception.notValid(res);
        }

        const user = await entity.get<IUserModelWithId>(params?.id);

        if (!user) {
          Exception.notFound(res);
          return;
        }

        res.json(user satisfies IAdminReadUserOutput);
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    put: async ({ body, params }: Request & { body: any }, res) => {
      try {
        if (!params?.id) {
          return Exception.notValid(res);
        }

        const user = await entity.get<IUserModelWithId>(params.id);

        if (!user) {
          Exception.notFound(res);
          return;
        }

        const { email, password } = body;
        if (email) {
          const valid = isEmail(email);

          if (!valid) {
            Exception.notValid(res);
            return;
          }
        }
        if (password) {
          const valid = isLength(password, { min: 6 });
          if (!valid) {
            Exception.notValid(res);
            return;
          }
          body.password = await encryptPassword(password);
        }

        const updated = await entity.update<IUserModelWithId>(params.id, body);

        res.json(updated satisfies IAdminPutUserOutput);
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    delete: async ({ params }: Request, res) => {
      try {
        if (!params.id) {
          return Exception.notValid(res);
        }

        await entity.remove(params.id);
        res.json({ code: ReturnCodes.USER_REMOVED } satisfies IAdminDeleteUserOutput);
      } catch (error) {
        Exception.parseError(res, error);
      }
    }
  });

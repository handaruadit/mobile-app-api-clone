import { Request } from 'express';

import { workspace as entity, user as userEntity } from '@/models';
import { IWorkspaceModelWithId } from '@/models/workspace';
import { IUserModelWithId } from '@/models/user';

import { ErrorCodes, ReturnCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';
import { isInvalidPaginateParams, isValidLatLong } from '@/lib/util';
import { IAdminListWorkspaceOutput, IAdminPostWorkspaceBody } from '@/interfaces/endpoints/admin/workspace';
import { IAdminDeleteOutput } from '@/types';

export default () =>
  resource({
    post: async ({ body }: Request & { body: IAdminPostWorkspaceBody }, res) => {
      try {
        const { name, ownerId, coordinates } = body as IAdminPostWorkspaceBody;

        if (!name || !ownerId) {
          Exception.notValid(res);
          return;
        }

        if (coordinates) {
          const valid = isValidLatLong(coordinates.latitude || 0, coordinates.longitude || 0);
          if (!valid) {
            Exception.notValid(res, ReturnCodes.INVALID_COORDINATES);
            return;
          }
        }

        const existingUser = await userEntity.get<IUserModelWithId>(ownerId);

        if (!existingUser) {
          Exception.notFound(res, ErrorCodes.USER_NOT_FOUND);
          return;
        }
        const created = await entity.create<IWorkspaceModelWithId>(body);

        res.json(created satisfies IWorkspaceModelWithId);
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
        const [total, workspaces] = await entity.paginatedFind<IWorkspaceModelWithId>({}, 'createdAt', 'descending', limit, true);

        res.json({
          data: workspaces,
          offset: Number(offset),
          page: !offset ? Number(page) : undefined,
          limit: Number(limit),
          total
        } satisfies IAdminListWorkspaceOutput);
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    read: async ({ params }: Request, res) => {
      try {
        if (!params?.id) {
          return Exception.notValid(res);
        }

        const user = await entity.get<IWorkspaceModelWithId>(params?.id);

        if (!user) {
          Exception.notFound(res);
          return;
        }

        res.json(user satisfies IWorkspaceModelWithId);
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    put: async ({ body, params }: Request & { body: any }, res) => {
      try {
        const { ownerId, coordinates } = body as IAdminPostWorkspaceBody;

        if (coordinates) {
          const valid = isValidLatLong(coordinates.latitude || 0, coordinates.longitude || 0);
          if (!valid) {
            Exception.notValid(res, ReturnCodes.INVALID_COORDINATES);
            return;
          }
        }

        if (ownerId) {
          const existingUser = await userEntity.get<IUserModelWithId>(ownerId);

          if (!existingUser) {
            Exception.notFound(res, ErrorCodes.USER_NOT_FOUND);
            return;
          }
        }

        const updated = await entity.update<IWorkspaceModelWithId>(params.id, body);

        res.json(updated satisfies IWorkspaceModelWithId);
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
        res.json({ code: ReturnCodes.WORKSPACE_DELETED } satisfies IAdminDeleteOutput);
      } catch (error) {
        Exception.parseError(res, error);
      }
    }
  });

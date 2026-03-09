import { Request } from 'express';

import { notification as entity } from '@/models';
import { INotificationModelWithId } from '@/models/notification';

import { ErrorCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';
import { isInvalidPaginateParams } from '@/lib/util';
import { IProtectedListNotificationOutput } from '@/types';

export default () =>
  resource({
    // permissions: {
    //   post: {
    //     onlyWorkspaceOwner: true
    //   },
    //   put: {
    //     entity: Entities.WORKSPACE,
    //     permissions: [Roles.ADMIN, Roles.WRITE]
    //   },
    //   delete: {
    //     onlyWorkspaceOwner: true
    //   }
    // },

    list: async ({ query, account }: Request, res) => {
      try {
        const { offset, page = 1, level, read } = query;
        const limit = 10;

        if (isInvalidPaginateParams(Number(offset), Number(page), Number(limit))) {
          Exception.notValid(res, ErrorCodes.INVALID_REQUEST as string);
          return;
        }

        if (!query) {
          return Exception.notValid(res);
        }
        const filtering: any = { userId: account._id };

        if (read && read === 'true') {
          filtering.read = true;
        }

        if (level && ['info', 'warning', 'danger'].includes(level as string)) {
          filtering.level = level;
        }

        const [total, notifications] = await entity.paginatedFind<INotificationModelWithId>(filtering, 'createdAt', 'descending', limit, true);

        res.json({
          data: notifications,
          offset: Number(offset),
          page: !offset ? Number(page) : undefined,
          limit: Number(limit),
          total
        } satisfies IProtectedListNotificationOutput);
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    // read: async ({ account, params }: Request, res) => {
    //   try {
    //     const [hasPermission, error] = await entity.isUserHasPermission(params.id, account._id, [Roles.READ]);

    //     if (!hasPermission) {
    //       Exception.unauthorized(res, error);
    //       return;
    //     }

    //     if (!params?.id) {
    //       return Exception.notValid(res);
    //     }

    //     const user = await entity.get<INotificationModelWithId>(params?.id);

    //     if (!user) {
    //       Exception.notFound(res);
    //       return;
    //     }

    //     res.json(user satisfies INotificationModelWithId);
    //   } catch (error) {
    //     Exception.parseError(res, error);
    //   }
    // },

    post: async ({ account, body }: Request, res) => {
      try {
        const { notificationIds } = body;

        if (!notificationIds || !notificationIds.length) {
          Exception.unauthorized(res, ErrorCodes.INVALID_REQUEST);
          return;
        }

        const updated = await entity.updateWhere(
          {
            _id: { _in: notificationIds },
            userId: account._id
          },
          { read: true }
        );

        res.json(updated satisfies INotificationModelWithId);
      } catch (error) {
        Exception.parseError(res, error);
      }
    }

    // only unpair owner
    // delete: async ({ account, params }: Request, res) => {
    //   try {
    //     if (!params.id) {
    //       return Exception.notValid(res);
    //     }
    //     const [existingWorkspace] = await workspaceEntity.find<IWorkspaceModelWithId>({
    //       ownerId: account._id
    //     });

    //     if (!existingWorkspace) {
    //       Exception.notFound(res, ErrorCodes.WORKSPACE_NOT_FOUND);
    //       return;
    //     }
    //     await entity.update<INotificationModelWithId>(params.id, { workspace: null });

    //     // await entity.remove(params.id);
    //     res.json({ code: ReturnCodes.DEVICE_DELETED } satisfies IAdminDeleteOutput);
    //   } catch (error) {
    //     Exception.parseError(res, error);
    //   }
    // }
  });

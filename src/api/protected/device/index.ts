import { Request } from 'express';

import { device as entity, workspace as workspaceEntity } from '@/models';
import { IDeviceModelWithId } from '@/models/device';
import { IWorkspaceModelWithId } from '@/models/workspace';

import { ErrorCodes, ReturnCodes, Roles } from '@/lib/enum';
import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';
import { isInvalidPaginateParams } from '@/lib/util';
import { IAdminDeleteOutput, IProtectedListDeviceOutput, IProtectedPostDeviceBody } from '@/types';

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

    // post: async ({ account, body }: Request & { body: IProtectedPostDeviceBody }, res) => {
    //   try {
    //     const { name, workspace } = body as IProtectedPostDeviceBody;

    //     if (!name || !workspace) {
    //       Exception.notValid(res);
    //       return;
    //     }

    //     const existingWorkspace = await workspaceEntity.get<IWorkspaceModelWithId>(workspace);

    //     if (!existingWorkspace) {
    //       Exception.notFound(res, ErrorCodes.WORKSPACE_NOT_FOUND);
    //       return;
    //     }
    //     if (!existingWorkspace.ownerId.equals(account._id)) {
    //       Exception.notFound(res, ErrorCodes.USER_NOT_FOUND_IN_WORKSPACE);
    //       return;
    //     }

    //     const payload: IProtectedPostDeviceBody = {
    //       name: body.name,
    //       description: body.description,
    //       isDefault: body.isDefault,
    //       brand: body.brand,
    //       plantedAt: body.plantedAt,
    //       company: body.company,
    //       workspace: body.workspace
    //     }
    //     const created = await entity.create<IDeviceModelWithId>(payload);

    //     res.json(created satisfies IDeviceModelWithId);
    //   } catch (error) {
    //     Exception.parseError(res, error);
    //   }
    // },

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
        const [total, workspaces] = await entity.paginatedFind<IDeviceModelWithId>({}, 'createdAt', 'descending', limit, true);

        res.json({
          data: workspaces,
          offset: Number(offset),
          page: !offset ? Number(page) : undefined,
          limit: Number(limit),
          total
        } satisfies IProtectedListDeviceOutput);
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    read: async ({ account, params }: Request, res) => {
      try {
        const [hasPermission, error] = await entity.isUserHasPermission(params.id, account._id, [Roles.READ]);

        if (!hasPermission) {
          Exception.unauthorized(res, error);
          return;
        }

        if (!params?.id) {
          return Exception.notValid(res);
        }

        const user = await entity.get<IDeviceModelWithId>(params?.id);

        if (!user) {
          Exception.notFound(res);
          return;
        }

        res.json(user satisfies IDeviceModelWithId);
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    put: async ({ account, body, params }: Request & { body: any }, res) => {
      try {
        const [hasPermission, error] = await entity.isUserHasPermission(params.id, account._id, [Roles.ADMIN, Roles.WRITE]);

        if (!hasPermission) {
          Exception.unauthorized(res, error);
          return;
        }

        const device = await entity.get<IDeviceModelWithId>(params.id);

        if (!device) {
          Exception.notValid(res, ErrorCodes.DEVICE_NOT_FOUND);
          return;
        }

        const payload: IProtectedPostDeviceBody = {
          name: body.name,
          description: body.description,
          isDefault: body.isDefault,
          plantedAt: body.plantedAt,
          company: body.company,
          workspace: body.workspace
        };

        const updated = await entity.update<IDeviceModelWithId>(params.id, payload);

        res.json(updated satisfies IDeviceModelWithId);
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    // only unpair owner
    delete: async ({ account, params }: Request, res) => {
      try {
        if (!params.id) {
          return Exception.notValid(res);
        }
        const [existingWorkspace] = await workspaceEntity.find<IWorkspaceModelWithId>({
          ownerId: account._id
        });

        if (!existingWorkspace) {
          Exception.notFound(res, ErrorCodes.WORKSPACE_NOT_FOUND);
          return;
        }
        await entity.update<IDeviceModelWithId>(params.id, { workspace: null });

        // await entity.remove(params.id);
        res.json({ code: ReturnCodes.DEVICE_DELETED } satisfies IAdminDeleteOutput);
      } catch (error) {
        Exception.parseError(res, error);
      }
    }
  });

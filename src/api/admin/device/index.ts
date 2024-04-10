import { Request } from 'express';

import {
  device as entity,
  workspace as workspaceEntity,
} from '@/models';
import { IUserModelWithId } from '@/models/user';
import { IDeviceModelWithId } from '@/models/device';

import { ErrorCodes, ReturnCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';
import { isInvalidPaginateParams } from '@/lib/util';
import { IAdminListDeviceOutput, IAdminPostDeviceBody } from '@/interfaces/endpoints/admin/device';
import { IAdminDeleteOutput } from '@/types';

export default () =>
  resource({
    post: async ({ body }: Request & { body: IAdminPostDeviceBody }, res) => {
      try {
        const { name, workspace } = body as IAdminPostDeviceBody;
        
        if (!name || !workspace) {
          Exception.notValid(res);
          return;
        }
  
        const existingWorkspace = await workspaceEntity.get<IUserModelWithId>(workspace);
  
        if (!existingWorkspace) {
          Exception.notFound(res, ErrorCodes.WORKSPACE_NOT_FOUND);
          return;
        }
        const created = await entity.create<IDeviceModelWithId>(body);

        res.json(created satisfies IDeviceModelWithId);
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
        const [total, workspaces] = await entity.paginatedFind<IDeviceModelWithId>(
          {},
          'createdAt',
          'descending',
          limit,
          true
        );
        
        res.json({
          data: workspaces,
          offset: Number(offset),
          page: !offset ? Number(page) : undefined,
          limit: Number(limit),
          total
        } satisfies IAdminListDeviceOutput);
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    read: async ({ params }: Request, res) => {
      try {
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

    put: async ({ body, params }: Request & { body: any }, res) => {
      try {
        const payload: IAdminPostDeviceBody = {
          name: body.name,
          description: body.description,
          isDefault: body.isDefault,
          brand: body.brand,
          plantedAt: body.plantedAt,
          company: body.company,
          workspace: body.workspace,
          maxPowerOutput: body.maxPowerOutput,
          batteryCapacity: body.batteryCapacity,
          panelSize: body.panelSize,
          totalPanel: body.totalPanel,
          efficiencyRating: body.efficiencyRating,
          votageOutput: body.votageOutput,
          material: body.material,
          warrantyExpiration: body.warrantyExpiration,
          inverterType: body.inverterType,
          weatherResistanceRating: body.weatherResistanceRating
        }

        const updated = await entity.update<IDeviceModelWithId>(params.id, payload);

        res.json(updated satisfies IDeviceModelWithId);
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
        res.json({ code: ReturnCodes.DEVICE_DELETED } satisfies IAdminDeleteOutput);
      } catch (error) {
        Exception.parseError(res, error);
      }
    }
  });

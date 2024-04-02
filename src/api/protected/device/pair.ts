import { Request } from 'express';

import {
  device as entity
} from '@/models';
import { IDeviceModelWithId } from '@/models/device';

import { ErrorCodes, ReturnCodes, Roles } from '@/lib/enum';
import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';
import { IProtectedPostDeviceBody, IProtectedPairDeviceOutput } from '@/types';

export default () =>
  resource({
    put: async ({ account, body, params }: Request & { body: any }, res) => {
      try {
        const [hasPermission, error] = await entity.isUserHasPermission(params.id, account._id, [Roles.ADMIN, Roles.WRITE, Roles.READ]);

        if (!hasPermission) {
          Exception.unauthorized(res, error);
          return;
        }

        const device = await entity.get<IDeviceModelWithId>(params.id);

        if (!device) {
          Exception.notValid(res, ErrorCodes.DEVICE_NOT_FOUND);
          return;
        }

        if (device.workspace) {
          // notify owner of workspace to request to join

          res.json({ code: ReturnCodes.JOIN_REQUEST_SENT } satisfies IProtectedPairDeviceOutput);
          return;
        }

        const payload: IProtectedPostDeviceBody = {
          name: body.name,
          description: body.description,
          isDefault: body.isDefault,
          plantedAt: body.plantedAt ?? new Date(),
          company: body.company,
          workspace: body.workspace
        }

        await entity.update<IDeviceModelWithId>(params.id, payload);

        res.json({ code: ReturnCodes.DEVICE_PAIRED } satisfies IProtectedPairDeviceOutput);
      } catch (error) {
        Exception.parseError(res, error);
      }
    },
  });

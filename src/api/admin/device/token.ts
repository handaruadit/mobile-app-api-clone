import { Request } from 'express';

import { device as entity, workspace as workspaceEntity } from '@/models';
import { IDeviceModelWithId } from '@/models/device';
import { IUserModelWithId } from '@/models/user';

import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';
import { ErrorCodes, IAdminPostDeviceBody } from '@/types';
import { DEFAULT_DEVICE_SPEC } from '@/lib/device';
import { generateDeviceToken } from '@/lib/jwt';

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
        const payload: IAdminPostDeviceBody = {
          ...DEFAULT_DEVICE_SPEC,
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
        };
        const created = await entity.create<IDeviceModelWithId>(payload);

        const token = generateDeviceToken({ device: created, type: 'access' });

        res.json({ token });
      } catch (error) {
        Exception.parseError(res, error);
      }
    }
  });

import { isValidObjectId } from 'mongoose';

import { device as deviceEntity, workspace as workspaceEntity } from '@/models';

import { ErrorCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';
import { OutputProtectedData } from '@/interfaces/endpoints/protected/workspace/main-data';
import { getMainStats } from '@/lib/statistics';
import { IDeviceModelWithId } from '@/models/device';

export default () =>
  resource({
    // permissions: {
    //   put: {
    //     entity: Entities.WORKSPACE,
    //     permissions: [Roles.ADMIN]
    //   },
    //   delete: {
    //     onlyWorkspaceOwner: true
    //   }
    // },

    /**
     * @openapi
     * /protected/workspace/data:
     *  get:
     *    description: /workspace get all statistics from all devices data in all workspaces
     *    tags:
     *      - protected
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedData"
     */
    list: async ({ account, query }, res) => {
      try {
        const { fromLastDays = '0', fromLastHours, workspaces } = query;
        // needed for ts
        if (typeof fromLastDays !== 'string') {
          Exception.notValid(res, ErrorCodes.INVALID_REQUEST);
          return;
        }

        const devices = workspaces
          ? await deviceEntity.find<IDeviceModelWithId>({
              workspace: { $in: Array.isArray(workspaces) ? workspaces : [workspaces] }
            })
          : await deviceEntity.findUsersDevices(account._id);

        const ids = devices.map(device => device._id);

        const parsedDays = parseInt(fromLastDays) ?? 0;
        const daysAgoStart = isNaN(parsedDays) ? 0 : parsedDays;
        const hoursAgoStart = fromLastHours ? parseInt(fromLastHours as string) : undefined;
        const stats = await getMainStats({ deviceIds: ids, daysAgoStart, hoursAgoStart });

        res.json({
          batteryData: stats[0][0] ?? {},
          inverterData: stats[1][0] ?? {},
          panelData: stats[2][0] ?? {},
          calculatedData: stats[3]
        } satisfies OutputProtectedData);
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    /**
     * @openapi
     * /protected/workspace/data/{id}:
     *  get:
     *    description: /workspace/data/{id}
     *    tags:
     *      - protected
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedData"
     */
    read: async ({ params, account, query }, res) => {
      try {
        // workspace id
        const { fromLastDays = '0', fromLastHours } = query;
        const { id } = params;

        if (!isValidObjectId(id)) {
          Exception.notValid(res, ErrorCodes.VALIDATION_ERROR);
          return;
        }
        const workspaces = await workspaceEntity.findWorkspacesOfUser(account._id);
        if (!workspaces.some(workspace => workspace._id.equals(id))) {
          Exception.notValid(res, ErrorCodes.USER_NOT_AUTHORIZED);
          return;
        }

        const deviceIds = await deviceEntity.findOnlyIds(id);

        const parsedDays = parseInt((fromLastDays as string) ?? '0');
        const daysAgoStart = isNaN(parsedDays) ? 0 : parsedDays;
        const hoursAgoStart = fromLastHours ? parseInt(fromLastHours as string) : undefined;
        const stats = await getMainStats({ deviceIds, daysAgoStart, hoursAgoStart });

        res.json({
          batteryData: stats[0][0] ?? {},
          inverterData: stats[1][0] ?? {},
          panelData: stats[2][0] ?? {},
          calculatedData: stats[3]
        } satisfies OutputProtectedData);
      } catch (error) {
        Exception.parseError(res, error);
      }
    }
  });

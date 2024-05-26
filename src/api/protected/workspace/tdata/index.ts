import { isValidObjectId } from 'mongoose';

import {
  device as deviceEntity,
  workspace as workspaceEntity
} from '@/models';

import { ErrorCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';
import { OutputProtectedTimeseriesData } from '@/interfaces/endpoints/protected/workspace/main-data';
import { getTimeseriesData } from '@/lib/statistics';

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
     * /protected/workspace/tdata:
     *  get:
     *    description: /workspace get all devices timeseries data in all workspaces
     *    tags:
     *      - protected
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedTimeseriesData"
     */
    list: async ({ account, query }, res) => {
      try {
        // 0 days mean only today
        const { fromLastDays = '0', fromLastHour } = query;
        if (typeof fromLastDays !== 'string' || (fromLastHour && typeof fromLastHour !== 'string')) {
          Exception.notValid(res, ErrorCodes.INVALID_REQUEST);
          return;
        }
        const devices = await deviceEntity.findUsersDevices(account._id);
        const ids = devices.map((device) => device._id);
    
        const parsedDays = parseInt(fromLastDays ?? '0');
        const days = isNaN(parsedDays) ? 0 : parsedDays;
        const parsedHours = parseInt(fromLastHour ?? '0');
        const hours = isNaN(parsedHours) ? 0 : parsedHours;
        const stats = await getTimeseriesData(ids, days, hours);

        res.json({
          batteryData: stats[0][0] ?? [],
          inverterData: stats[1][0] ?? [],
          panelData: stats[2][0] ?? [],
        } satisfies OutputProtectedTimeseriesData);
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
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedTimeseriesData"
     */
    read: async ({ params, account, query }, res) => {
      try {
        // workspace id
        const { fromLastDays = '0', fromLastHour } = query;
        if (typeof fromLastDays !== 'string' || (fromLastHour && typeof fromLastHour !== 'string')) {
          Exception.notValid(res, ErrorCodes.INVALID_REQUEST);
          return;
        }
        const { id } = params;

        if (!isValidObjectId(id)) {
          Exception.notValid(res, ErrorCodes.VALIDATION_ERROR);
          return;
        }
        const workspaces = await workspaceEntity.findWorkspacesOfUser(account._id);

        if (!workspaces.some((workspace) => workspace._id.equals(id))) {
          Exception.notValid(res, ErrorCodes.USER_NOT_AUTHORIZED);
          return;
        }

        const deviceIds = await deviceEntity.findOnlyIds(id);

        const parsedDays = parseInt(fromLastDays ?? '0');
        const days = isNaN(parsedDays) ? 0 : parsedDays;
        const parsedHours = parseInt(fromLastHour ?? '0');
        const hours = isNaN(parsedHours) ? 0 : parsedHours;
        const stats = await getTimeseriesData(deviceIds, days, hours);

        res.json({
          batteryData: stats[0][0] ?? [],
          inverterData: stats[1][0] ?? [],
          panelData: stats[2][0] ?? [],
        } satisfies OutputProtectedTimeseriesData);
      } catch (error) {
        Exception.parseError(res, error);
      } 
    },
  });

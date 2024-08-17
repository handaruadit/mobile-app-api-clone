import { isValidObjectId } from 'mongoose';

import { device as deviceEntity, workspace as workspaceEntity } from '@/models';

import { ErrorCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';
import { ITimeseriesStatsOutput } from '@/types';
import TimeseriesProcessor from '@/batari/TimeseriesProcessor';

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
     *    description:
     *      /workspace get all devices timeseries data in all workspaces
     *      should handle:
     *        - realtime data in 30 minutes range
     *        - data in the last 24 hour
     *        - daily data in the last 7 days
     *        - data in a month
     *      should give data about:
     *        - power generated (required) / panel
     *        - power usage / inverter out
     *        - battery charged / current in
     *        - battery out / current out
     *    tags:
     *      - protected
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/ITimeseriesStatsOutput"
     */
    list: async ({ account, query }, res) => {
      try {
        const { startTime, endTime: endTimeQuery } = query;

        if (typeof startTime !== 'string' || (endTimeQuery && typeof endTimeQuery !== 'string')) {
          Exception.notValid(res, ErrorCodes.INVALID_REQUEST);
          return;
        }
        if (isNaN(Date.parse(startTime)) || (endTimeQuery && isNaN(Date.parse(endTimeQuery)))) {
          Exception.notValid(res, ErrorCodes.INVALID_DATE_REQUEST);
          return;
        }
        const endTime = query.endTime ? new Date(query.endTime as string) : new Date();

        const start = new Date(startTime);
        const end = new Date(endTime);

        const devices = await deviceEntity.findUsersDevices(account._id);
        const ids = devices.map(device => device._id);

        if (ids.length === 0) {
          res.json([] satisfies ITimeseriesStatsOutput);
        }

        const processor = new TimeseriesProcessor(ids);
        const stats = await processor.getTimeseriesStats({ startTime: start, endTime: end });
        res.json(stats satisfies ITimeseriesStatsOutput);
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
     *            "$ref": "./components.yaml#/components/schemas/ITimeseriesStatsOutput"
     */
    read: async ({ params, account, query }, res) => {
      try {
        // workspace id
        const { startTime, endTime: endTimeQuery } = query;
        if (typeof startTime !== 'string' || (endTimeQuery && typeof endTimeQuery !== 'string')) {
          Exception.notValid(res, ErrorCodes.INVALID_REQUEST);
          return;
        }
        if (isNaN(Date.parse(startTime)) || (endTimeQuery && isNaN(Date.parse(endTimeQuery)))) {
          Exception.notValid(res, ErrorCodes.INVALID_REQUEST);
          return;
        }
        const endTime = query.endTime ? new Date(query.endTime as string) : new Date();

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

        const start = new Date(startTime);
        const end = new Date(endTime);
        const deviceIds = await deviceEntity.findOnlyIds(id);
        const processor = new TimeseriesProcessor(deviceIds);
        const stats = await processor.getTimeseriesStats({ startTime: start, endTime: end });
        // let total = stats.reduce((sum, item) => sum + (item.charged ?? 0), 0);
        res.json(stats satisfies ITimeseriesStatsOutput);
      } catch (error) {
        Exception.parseError(res, error);
      }
    }
  });

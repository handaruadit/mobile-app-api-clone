import { isValidObjectId } from 'mongoose';

import {
  device as deviceEntity,
  inverterData,
  workspace as workspaceEntity
} from '@/models';

import { ErrorCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';
import { OutputProtectedData } from '@/interfaces/endpoints/protected/workspace/main-data';

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
     *    description: /workspace get all devices data in all workspaces
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
        const { fromLastDays = '0' } = query;
        if (typeof fromLastDays !== 'string') {
          Exception.notValid(res, ErrorCodes.INVALID_REQUEST);
          return;
        }

        const devices = await deviceEntity.findUsersDevices(account._id);
        const ids = devices.map((device) => device._id);
    
        const parsedDays = parseInt(fromLastDays ?? '0');
        const days = isNaN(parsedDays) ? 0 : parsedDays;
        const stats = await inverterData.getMainStats(ids, days);
        res.json(stats[0] satisfies OutputProtectedData);
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
        const { fromLastDays = '0' } = query;
        if (typeof fromLastDays !== 'string') {
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
        const stats = await inverterData.getMainStats(deviceIds, days);

        res.json(stats[0] satisfies OutputProtectedData);
      } catch (error) {
        Exception.parseError(res, error);
      } 
    },
  });

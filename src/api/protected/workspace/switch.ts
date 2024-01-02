import { isValidObjectId } from 'mongoose';

import {
  workspace as entity,
  user as entityUser,
  company as entityCompany
} from '@/models';
import { IUserModelWithId } from '@/models/user';
import { IWorkspaceModelWithId as IEntityModel } from '@/models/workspace';
import { ICompanyModelWithId } from '@/types';

import { OutputProtectedWorkspaceSwitchPut } from '@/interfaces/endpoints/protected/workspace/switch';
import { Entities, ErrorCodes, Roles } from '@/lib/enum';
import Exception from '@/lib/exception';
import { generateJwtTokens } from '@/lib/jwt';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    permissions: {
      put: {
        entity: Entities.WORKSPACE,
        permissions: [Roles.ADMIN, Roles.WRITE, Roles.READ]
      }
    },
    /**
     * @openapi
     * /protected/workspace/switch/{id}:
     *  put:
     *    description: /workspace/switch/{id}
     *    tags:
     *      - protected
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/InputProtectedWorkspaceSwitchUserPutBody"
     *    responses:
     *      200:
     *        description: Returns the updated entity
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedWorkspaceSwitchPut"
     */
    put: async ({ body, params }, res) => {
      const { id } = params;
      const { userId } = body;

      if (!isValidObjectId(id) || !isValidObjectId(userId)) {
        Exception.notValid(res, ErrorCodes.VALIDATION_ERROR);
        return;
      }

      const [item] = await entity.find<IEntityModel>({ _id: id });
      if (!item) {
        Exception.notFound(res, ErrorCodes.WORKSPACE_NOT_FOUND);
        return;
      }

      const [user] = await entityUser.find<IUserModelWithId>({
        _id: userId
      });
      if (!user) {
        Exception.notFound(res, ErrorCodes.USER_NOT_FOUND);
        return;
      }

      const [company] = await entityCompany.find<ICompanyModelWithId>({
        _id: item.companyId
      });

      if (!company) {
        Exception.notFound(res, ErrorCodes.COMPANY_NOT_FOUND);
        return;
      }

      // User already exist
      const userAlreadyExistInWorkspace =
        company.ownerId?.equals(userId) ||
        item.ownerId?.equals(userId) ||
        item.members?.some(({ id }) => id?.equals(userId));

      if (!userAlreadyExistInWorkspace) {
        Exception.notFound(res, ErrorCodes.USER_NOT_FOUND_IN_WORKSPACE);
        return;
      }

      const tokens = await generateJwtTokens({
        user,
        workspaceId: id
      });

      res
        .status(200)
        .json({ tokens } satisfies OutputProtectedWorkspaceSwitchPut);
      return;
    }
  });

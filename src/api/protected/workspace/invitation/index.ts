import { isValidObjectId } from 'mongoose';

import { tokenInvitation as tokenInvit } from '@/models';
import { ITokenInvitationModelWithId } from '@/models/tokenInvitation';

import { Entities, ErrorCodes, ReturnCodes, Roles } from '@/lib/enum';
import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    permissions: {
      list: {
        entity: Entities.WORKSPACE,
        permissions: [Roles.ADMIN, Roles.WRITE, Roles.READ]
      },
      put: {
        entity: Entities.WORKSPACE,
        permissions: [Roles.ADMIN, Roles.WRITE]
      },
      delete: {
        entity: Entities.WORKSPACE,
        permissions: [Roles.ADMIN, Roles.WRITE]
      }
    },

    /**
     * @openapi
     * /protected/workspace/invitation/{id}:
     *  get:
     *    description: /workspace/invitation/{id}
     *    tags:
     *      - protected
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedWorkspaceInvitationList"
     */
    list: async ({ account }, res) => {
      const tokens = await tokenInvit.find<ITokenInvitationModelWithId>({
        workspaceId: account.workspaceId
      });

      res.json({ tokens });
      return;
    },

    /**
     * @openapi
     * /protected/workspace/invitation/{id}:
     *  put:
     *    description: /workspace/invitation/{id}
     *    tags:
     *      - protected
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/InputProtectedWorkspaceInvitationPutBody"
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedWorkspaceInvitationPut"
     */
    put: async ({ body, account, params }, res) => {
      const { id } = params;
      const { permissions } = body;

      if (!isValidObjectId(id)) {
        Exception.notValid(res, ErrorCodes.INVITATION_NOT_FOUND);
        return;
      }

      const [token] = await tokenInvit.find<ITokenInvitationModelWithId>({
        _id: id,
        workspaceId: account.workspaceId
      });
      if (!token) {
        Exception.notFound(res, ErrorCodes.INVITATION_NOT_FOUND);
        return;
      }

      await tokenInvit.update(id, { permissions: permissions });
      res.json({ code: ReturnCodes.PERMISSIONS_UPDATED });
      return;
    },

    /**
     * @openapi
     * /protected/workspace/invitation/{id}:
     *  delete:
     *    description: /workspace/invitation/{id}
     *    tags:
     *      - protected
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedWorkspaceInvitationDelete"
     */

    delete: async ({ account, params }, res) => {
      const { id } = params;

      if (!isValidObjectId(id)) {
        Exception.notValid(res, ErrorCodes.INVITATION_NOT_FOUND);
        return;
      }

      const [token] = await tokenInvit.find<ITokenInvitationModelWithId>({
        _id: id,
        workspaceId: account.workspaceId
      });
      if (!token) {
        Exception.notFound(res, ErrorCodes.INVITATION_NOT_FOUND);
        return;
      }

      await tokenInvit.remove(id);
      res.json({ code: ReturnCodes.INVITATION_DELETED });
      return;
    }
  });

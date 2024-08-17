import { workspace as entity, user as entityUser } from '@/models';
import { IUserModelWithId as IEntityUser } from '@/models/user';
import { IWorkspaceModelWithId as IEntityModel } from '@/models/workspace';

import { OutputProtectedWorkspaceOwnershipPut } from '@/interfaces/endpoints/protected/workspace/ownership';
import { Entities, ErrorCodes, ReturnCodes, Roles } from '@/lib/enum';
import Exception from '@/lib/exception';
import { sendOwnershipEmail } from '@/lib/jetmail';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    permissions: {
      put: {
        onlyWorkspaceOwner: true
      }
    },

    /**
     * @openapi
     * /protected/workspace/ownership/{id}:
     *  put:
     *    description: /workspace/ownership/{id}
     *    tags:
     *      - protected
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/InputProtectedWorkspaceOwnershipPutBody"
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedWorkspaceOwnershipPut"
     */
    put: async ({ body, params }, res) => {
      try {
        const { id } = params;
        const { newOwnerId } = body;

        const workspace = await entity.get<IEntityModel>(id);
        if (!workspace) {
          Exception.notFound(res, ErrorCodes.WORKSPACE_NOT_FOUND);
          return;
        }
        if (workspace.isDefault) {
          Exception.forbidden(res);
          return;
        }
        const isNewOwnerMember = workspace.members.some(el => el.id?.equals(newOwnerId));
        if (!isNewOwnerMember) {
          Exception.forbidden(res, ErrorCodes.WORKSPACE_NEW_OWNER_MEMBER);
          return;
        }

        const oldOwnerId = workspace.ownerId;
        const newOwner = await entityUser.get<IEntityUser>(newOwnerId);

        const updatedMembers = workspace.members.filter(member => !member.id?.equals(newOwnerId));

        updatedMembers.push({
          id: oldOwnerId,
          permissions: [
            {
              entity: Entities.WORKSPACE,
              role: Roles.ADMIN
            }
          ]
        });

        await entity.update(id, {
          ownerId: newOwnerId,
          members: updatedMembers
        });

        res.json({
          code: ReturnCodes.OWNER_CHANGED
        } satisfies OutputProtectedWorkspaceOwnershipPut);

        sendOwnershipEmail(newOwner?.email, newOwner?.name, workspace.name || '').catch(console.error);
      } catch (error) {
        Exception.parseError(res, error);
      }
    }
  });

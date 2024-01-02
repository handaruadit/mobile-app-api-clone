import { isValidObjectId } from 'mongoose';

import {
  workspace as entity,
  company as entityCompany,
  user as entityUser,
  tokenInvitation
} from '@/models';
import { ICompanyModelWithId } from '@/models/company';
import { ITokenInvitationModelWithId } from '@/models/tokenInvitation';
import { IUserModelWithId as IEntityUser } from '@/models/user';
import {
  IWorkspaceModelWithId as IEntityModel,
  IWorkspaceModelPayload as IEntityPayload
} from '@/models/workspace';

import {
  OutputProtectedWorkspaceDelete,
  OutputProtectedWorkspaceGet,
  OutputProtectedWorkspaceList,
  OutputProtectedWorkspacePost,
  OutputProtectedWorkspacePut
} from '@/interfaces/endpoints/protected/workspace';
import { Entities, ErrorCodes, ReturnCodes, Roles } from '@/lib/enum';
import Exception from '@/lib/exception';
import { checkJWTPermissions } from '@/lib/permission';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    permissions: {
      post: {
        onlyCompanyOwner: true
      },
      put: {
        entity: Entities.WORKSPACE,
        permissions: [Roles.ADMIN]
      },
      delete: {
        onlyWorkspaceOwner: true
      }
    },

    /**
     * @openapi
     * /protected/workspace:
     *  get:
     *    description: /workspace
     *    tags:
     *      - protected
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedWorkspaceList"
     */
    list: async ({ account, jwt }, res) => {
      const [isCompanyOwner] = await entityCompany.find<ICompanyModelWithId>({
        _id: account.companyId,
        ownerId: account._id
      });

      const pipeline = [
        {
          $match: {
            $or: [
              { ownerId: account._id },
              {
                members: {
                  $elemMatch: {
                    id: account._id,
                    permissions: {
                      $elemMatch: {
                        entity: Entities.WORKSPACE,
                        role: {
                          $in: [Roles.READ, Roles.WRITE, Roles.ADMIN]
                        }
                      }
                    }
                  }
                }
              },
              isCompanyOwner
                ? { companyId: account.companyId }
                : { companyId: '_' }
            ]
          }
        },
        {
          $lookup: {
            from: 'companies',
            localField: 'companyId',
            foreignField: '_id',
            as: 'company'
          }
        },
        {
          $match: {
            'company.0': { $exists: true }
          }
        },
        {
          $lookup: {
            from: 'tokeninvitations',
            localField: '_id',
            foreignField: 'workspaceId',
            as: 'invitations'
          }
        },
        {
          $addFields: {
            invitationCount: { $size: '$invitations' }
          }
        },
        {
          $project: {
            invitations: 0
          }
        }
      ];

      const workspaces = await entity.model.aggregate<
        IEntityModel & {
          invitationCount?: number;
          company: ICompanyModelWithId[];
        }
      >(pipeline);

      const userHasWritePermission = checkJWTPermissions({
        jwt,
        entity: Entities.WORKSPACE,
        permissions: [Roles.ADMIN, Roles.WRITE]
      });

      if (!userHasWritePermission) {
        workspaces.forEach((workspace) => {
          workspace.invitationCount = undefined;
          workspace.members = [];
        });
      }

      res.json({
        workspaces: workspaces.map((el) => ({
          ...el,
          company: undefined,
          companyName: el.company?.[0]?.name
        }))
      } satisfies OutputProtectedWorkspaceList);
      return;
    },

    /**
     * @openapi
     * /protected/workspace/{id}:
     *  get:
     *    description: /workspace/{id}
     *    tags:
     *      - protected
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedWorkspaceGet"
     */
    read: async ({ params, account, jwt }, res) => {
      const { id } = params;

      if (!isValidObjectId(id)) {
        Exception.notValid(res, ErrorCodes.VALIDATION_ERROR);
        return;
      }

      const workspace = await entity.get<IEntityModel>(id, true);
      if (!workspace) {
        Exception.notFound(res, ErrorCodes.WORKSPACE_NOT_FOUND);
        return;
      }

      const isMemberOrOwner =
        // @ts-ignore
        workspace.members.some((el) => el?.id?.equals(account._id)) ||
        workspace._owner?._id.equals(account._id);

      if (!isMemberOrOwner) {
        Exception.notFound(res, ErrorCodes.WORKSPACE_NOT_FOUND);
        return;
      }

      const userHasWritePermission = checkJWTPermissions({
        jwt,
        entity: Entities.WORKSPACE,
        permissions: [Roles.ADMIN, Roles.WRITE]
      });

      if (!userHasWritePermission) {
        workspace.members = [];
        workspace._members = [];
      } else {
        workspace._members?.forEach((member) => {
          // @ts-ignore
          member.permissions = workspace.members.find((el) =>
            el?.id?.equals(member._id)
          )?.permissions;
        });
      }

      const invitations =
        await tokenInvitation.find<ITokenInvitationModelWithId>({
          workspaceId: id
        });

      const [company] = await entityCompany.find<ICompanyModelWithId>({
        _id: workspace.companyId
      });

      const [user] = await entityUser.find<IEntityUser>({
        _id: company.ownerId
      });

      const _companyOwner = {
        _id: user._id,
        name: user.name,
        email: user.email
      };

      res.json({
        workspace: { ...workspace, invitations, _companyOwner }
      } satisfies OutputProtectedWorkspaceGet);
      return;
    },

    /**
     * @openapi
     * /protected/workspace:
     *  post:
     *    description: /workspace
     *    tags:
     *      - protected
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/InputProtectedWorkspacePostBody"
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedWorkspacePost"
     */
    post: async ({ account, body }, res) => {
      const { name, language, timezone } = body;

      const [workspaceCompany] = await entityCompany.find<ICompanyModelWithId>({
        ownerId: account._id
      });

      if (!workspaceCompany) {
        Exception.notFound(res, ErrorCodes.COMPANY_NOT_FOUND);
        return;
      }

      const payload: IEntityPayload = {
        name,
        language,
        timezone,
        isDefault: false,
        ownerId: account._id,
        companyId: workspaceCompany._id
      };
      const workspace = await entity.create<IEntityModel>(payload);

      res.json({ workspace } satisfies OutputProtectedWorkspacePost);
    },

    /**
     * @openapi
     * /protected/workspace/{id}:
     *  put:
     *    description: /workspace/{id}
     *    tags:
     *      - protected
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/InputProtectedWorkspacePutBody"
     *    responses:
     *      200:
     *        description: Returns the updated entity
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedWorkspacePut"
     */
    put: async ({ body, params }, res) => {
      const { id } = params;

      if (!isValidObjectId(id)) {
        Exception.notValid(res, ErrorCodes.VALIDATION_ERROR);
        return;
      }

      const payload: IEntityPayload = {
        ...body
      };

      if (payload.ownerId) delete payload.ownerId;

      const workspace = await entity.update<IEntityModel>(id, payload);

      res.json({ workspace } satisfies OutputProtectedWorkspacePut);
    },

    /**
     * @openapi
     * /protected/workspace/{id}:
     *  delete:
     *    description: /workspace/{id}
     *    tags:
     *      - protected
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedWorkspaceUserDelete"
     */
    delete: async ({ params }, res) => {
      const { id } = params;

      if (!isValidObjectId(id)) {
        Exception.notValid(res, ErrorCodes.VALIDATION_ERROR);
        return;
      }

      await entity.remove(id);

      res.json({
        code: ReturnCodes.WORKSPACE_DELETED
      } satisfies OutputProtectedWorkspaceDelete);
    }
  });

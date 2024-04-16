import { isValidObjectId, Types } from 'mongoose';

import {
  workspace as entity,
  tokenInvitation,
  device as deviceEntity
} from '@/models';
import { ITokenInvitationModelWithId } from '@/models/tokenInvitation';
import {
  IWorkspaceModelWithId as IEntityModel,
  IWorkspaceModelWithId
} from '@/models/workspace';

import {
  InputProtectedWorkspacePostBody,
  InputProtectedWorkspacePutBody,
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
              }
            ]
          }
        },
        {
          $lookup: {
            from: 'devices',
            localField: '_id',
            foreignField: 'workspace',
            as: 'devices'
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
            invitationCount: { $size: '$invitations' },
            deviceCount: { $size: '$devices' },
            totalPanelCapacity: { $sum: '$devices.panelCapacity' }
          }
        },
        {
          $project: {
            invitations: 0
          }
        }
      ];
      const workspaces = await entity.model.aggregate<
        IEntityModel & { invitationCount?: number; deviceCount?: number; totalPanelCapacity?: number }
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
        workspaces
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
        (workspace._owner?._id as Types.ObjectId).equals(account._id);

      if (!isMemberOrOwner) {
        Exception.notFound(res, ErrorCodes.USER_NOT_AUTHORIZED);
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

      res.json({
        workspace: { ...workspace, invitations }
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
      const data = body as InputProtectedWorkspacePostBody;
      const payload = {
        ...body,
        name: data.name,
        language: data.language,
        timezone: data.timezone,
        ownerId: account._id,
        coordinates: data.coordinates ? {
          latitude: data.coordinates.latitude,
          longitude: data.coordinates.longitude,
          elevation: data.coordinates.elevation
        } : undefined,
        location:  data.coordinates ? {
          type: 'Point',
          coordinates: [body.coordinates?.longitude, body.coordinates?.latitude]
        } : undefined,
        members: data.members
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
    put: async ({ account, body, params }, res) => {
      const { id } = params;

      if (!isValidObjectId(id)) {
        Exception.notValid(res, ErrorCodes.VALIDATION_ERROR);
        return;
      }

      const [checkOwnership] = await entity.findWorkspacesOfUser(account._id);

      if (!checkOwnership) {
        Exception.notValid(res, ErrorCodes.USER_NOT_AUTHORIZED);
        return;
      }

      
      if (body.ownerId) delete body.ownerId;

      const payload: InputProtectedWorkspacePutBody = {
        ...body,
        name: body.name,
        language: body.language,
        timezone: body.timezone,
        coordinates: body.coordinates ? {
          latitude: body.coordinates.latitude,
          longitude: body.coordinates.longitude,
          elevation: body.coordinates.elevation
        } : undefined,
        location: {
          type: 'Point',
          coordinates: [body.coordinates?.longitude, body.coordinates?.latitude]
        },
        members: body.members
      };

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
    delete: async ({ account, params }, res) => {
      const { id } = params;

      if (!isValidObjectId(id)) {
        Exception.notValid(res, ErrorCodes.VALIDATION_ERROR);
        return;
      }

      const [checkOwnership] = await entity.find<IWorkspaceModelWithId>({
        ownerId: account._id   
      });

      if (!checkOwnership) {
        Exception.notValid(res, ErrorCodes.USER_NOT_AUTHORIZED);
        return;
      }

      // check if has device
      const devices = await deviceEntity.find<IDeviceModelWithId>({ workspace: id });
      if (devices && devices.length > 0) {
        Exception.notFound(res, ErrorCodes.WORKSPACE_STILL_HAS_SOLAR_PANEL);
        return;
      }

      await entity.remove(id);

      res.json({
        code: ReturnCodes.WORKSPACE_DELETED
      } satisfies OutputProtectedWorkspaceDelete);
    }
  });

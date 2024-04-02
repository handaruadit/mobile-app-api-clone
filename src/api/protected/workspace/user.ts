import { isValidObjectId } from 'mongoose';

import {
  workspace as entity,
  company as entityCompany,
  user as entityUser,
  tokenInvitation as tokenInvit
} from '@/models';
import { ICompanyModelWithId } from '@/models/company';
import { ITokenInvitationModelWithId } from '@/models/tokenInvitation';
import { IUserModelWithId } from '@/models/user';
import { IWorkspaceModelWithId as IEntityModel } from '@/models/workspace';

import {
  OutputProtectedWorkspaceUserDelete,
  OutputProtectedWorkspaceUserPost,
  OutputProtectedWorkspaceUserPut
} from '@/interfaces/endpoints/protected/workspace/user';
import { randomToken } from '@/lib/encode';
import { ErrorCodes, ReturnCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import { sendInvitationSignUpEmail } from '@/lib/jetmail';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
  //   permissions: {
  //     put: {
  //       entity: Entities.WORKSPACE,
  //       permissions: [Roles.ADMIN, Roles.WRITE]
  //     },
  //     delete: {
  //       entity: Entities.WORKSPACE,
  //       permissions: [Roles.ADMIN]
  //     }
  //   },

    /**
     * @openapi
     * /protected/workspace/user:
     *  post:
     *    description: /workspace/user
     *    tags:
     *      - protected
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/InputProtectedWorkspaceUserPostBody"
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedWorkspaceUserPost"
     */
    post: async (req, res) => {
      const { account, body } = req;
      const {
        email,
        workspaceId,
        permissions
      }: {
        email: string;
        workspaceId: string;
        permissions: [{ entity: string; role: string }];
      } = body;

      const [workspaceCompany] = await entityCompany.find<ICompanyModelWithId>({
        ownerId: account._id
      });
      if (!workspaceCompany) {
        Exception.notFound(res, ErrorCodes.COMPANY_NOT_FOUND);
        return;
      }

      const [workspaceCurrent] = await entity.find<IEntityModel>({
        _id: workspaceId
      });
      if (!workspaceCurrent) {
        Exception.notFound(res, ErrorCodes.WORKSPACE_NOT_FOUND);
        return;
      }

      const [user] = await entityUser.find<IUserModelWithId>({ email });
      let [existToken] = await tokenInvit.find<ITokenInvitationModelWithId>({
        emailUser: email
      });

      // New user & token already exist
      if (!user && existToken) {
        Exception.conflict(res, ErrorCodes.INVITATION_ALREADY_SENT);
        return;
      }

      // New user & no token
      if (!user && !existToken) {
        const payload = {
          userEmail: email,
          workspaceId: workspaceCurrent._id,
          permissions: permissions,
          token: randomToken()
        };

        existToken = await tokenInvit.create<ITokenInvitationModelWithId>(
          payload
        );

        await sendInvitationSignUpEmail(
          email,
          workspaceCompany.name,
          //@ts-ignore Because of Mongoose InferSchema bug;
          existToken.token
        ).catch(console.error);

        res.json({ code: ReturnCodes.INVITATION_SENT });
        return;
      }

      // User already exist
      const userAlreadyExistInWorkspace = workspaceCurrent.members.some(
        (member) => member.id?.equals(user._id)
      );

      if (userAlreadyExistInWorkspace) {
        Exception.conflict(res, ErrorCodes.USER_ALREADY_IN_WORKSPACE);
        return;
      }

      const workspacesOfUser = await entity.find<IEntityModel>({
        $or: [
          { ownerId: user._id },
          { companyId: workspaceCompany._id },
          {
            members: {
              $elemMatch: {
                id: user._id
              }
            }
          }
        ]
      });

      // User already member of another workspaces but not all in the same company
      if (workspacesOfUser.length > 0) {
        Exception.conflict(res, ErrorCodes.USER_ALREADY_IN_OTHER_COMPANY);
        return;
      }

      //check if User is Owner of a company or a workspace
      const companiesOwner = await entityCompany.find<ICompanyModelWithId>({
        ownerId: user._id
      });
      const workspacesOwner = await entity.find<IEntityModel>({
        ownerId: user._id
      });
      if (companiesOwner.length > 0 || workspacesOwner.length > 0) {
        Exception.forbidden(res, ErrorCodes.WORKSPACE_USER_ALREADY_OWNER);
        return;
      }

      await entity.findOneAndUpdate(
        { _id: workspaceCurrent._id },
        {
          $push: {
            members: {
              id: user._id,
              permissions: permissions
            }
          }
        }
      );

      res.json({
        code: ReturnCodes.USER_ADDED
      } satisfies OutputProtectedWorkspaceUserPost);
    },

    /**
     * @openapi
     * /protected/workspace/user/{id}:
     *  put:
     *    description: /workspace/user/{id}
     *    tags:
     *      - protected
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/InputProtectedWorkspaceUserPutBody"
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedWorkspaceUserPut"
     */
    put: async ({ body, params }, res) => {
      try {
        const { id } = params;
        const { workspaceId, permissions } = body;

        if (!isValidObjectId(id) || !isValidObjectId(workspaceId)) {
          Exception.notValid(res, ErrorCodes.VALIDATION_ERROR);
          return;
        }

        const [item] = await entity.find<IEntityModel>({ _id: workspaceId });
        if (!item) {
          Exception.notFound(res, ErrorCodes.WORKSPACE_NOT_FOUND);
          return;
        }

        await entity.findOneAndUpdate(
          { _id: item._id, 'members.id': id },
          { $set: { 'members.$.permissions': permissions } }
        );

        res.json({
          code: ReturnCodes.PERMISSIONS_UPDATED
        } satisfies OutputProtectedWorkspaceUserPut);
      } catch (error) {
        Exception.parseError(res, error);
      }
    },

    /**
     * @openapi
     * /protected/workspace/user/{id}:
     *  delete:
     *    description: /workspace/user/{id}
     *    tags:
     *      - protected
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedWorkspaceUserDelete"
     */
    delete: async ({ body, params }, res) => {
      try {
        const { id } = params;
        const { workspaceId } = body;

        if (!isValidObjectId(id) || !isValidObjectId(workspaceId)) {
          Exception.notValid(res, ErrorCodes.VALIDATION_ERROR);
          return;
        }

        const [item] = await entity.find<IEntityModel>({
          _id: workspaceId
        });
        if (!item) {
          Exception.notFound(res, ErrorCodes.WORKSPACE_NOT_FOUND);
          return;
        }

        await entity.findOneAndUpdate(
          { _id: item._id },
          { $pull: { members: { id } } }
        );

        res.json({
          code: ReturnCodes.USER_REMOVED
        } satisfies OutputProtectedWorkspaceUserDelete);
      } catch (error) {
        Exception.parseError(res, error);
      }
    }
  });

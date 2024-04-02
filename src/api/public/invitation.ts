import isLength from 'validator/lib/isLength';

import {
  tokenInvitation as entity,
  user as entityUser,
  workspace as entityWorkspace
} from '@/models';
import { ITokenInvitationModelWithId as IEntityModel } from '@/models/tokenInvitation';
import { IUserModelWithId } from '@/models/user';
import { IWorkspaceModelWithId } from '@/models/workspace';

import {
  OutputPublicInvitationGet,
  OutputPublicInvitationPost
} from '@/interfaces/endpoints/public/invitation';
import { encryptPassword } from '@/lib/encode';
import { ErrorCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import { generateJwtTokens } from '@/lib/jwt';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    /**
     * @openapi
     * /public/invitation/{id}:
     *  get:
     *    description: /invitation/{id}
     *    tags:
     *      - public
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputPublicInvitationGet"
     */
    read: async ({ params }, res) => {
      const [token] = await entity.find<IEntityModel>({
        token: params.id
      });

      if (!token) {
        Exception.notFound(res, ErrorCodes.INVITATION_NOT_FOUND);
        return;
      }

      const [workspace] = await entityWorkspace.find<IWorkspaceModelWithId>({
        _id: token.workspaceId
      });
      if (!workspace) {
        Exception.notFound(res, ErrorCodes.WORKSPACE_NOT_FOUND);
        return;
      }

      // const [company] = await entityCompany.find<ICompanyModelWithId>({
      //   _id: workspace.companyId
      // });
      // if (!company) {
      //   Exception.notFound(res, ErrorCodes.COMPANY_NOT_FOUND);
      //   return;
      // }

      const result = {
        userEmail: token.userEmail,
        // company: company.name,
        workspace: workspace.name
      };

      res.status(200).json(result satisfies OutputPublicInvitationGet);
    },

    post: async ({ body }, res) => {
      const { name, token, password } = body;

      const [tokenExist] = await entity.find<IEntityModel>({
        token
      });
      if (!tokenExist) {
        Exception.notFound(res, ErrorCodes.INVITATION_NOT_FOUND);
        return;
      }

      const valid =
        isLength(password, { min: 6 }) && isLength(name, { min: 2 });

      if (!valid) {
        Exception.notValid(res);
        return;
      }

      const email = tokenExist.userEmail;
      const workspaceId = tokenExist.workspaceId;
      const alreadyExistsUser = await entityUser.find<IUserModelWithId>({
        email
      });
      if (alreadyExistsUser.length > 0) {
        Exception.conflict(res, ErrorCodes.EMAIL_ALREADY_EXISTS);
        return;
      }

      const [workspaceExists] =
        await entityWorkspace.find<IWorkspaceModelWithId>({
          _id: workspaceId
        });
      if (!workspaceExists) {
        Exception.notFound(res, ErrorCodes.WORKSPACE_NOT_FOUND);
        return;
      }

      const payloadUser = {
        email,
        password: await encryptPassword(password),
        name
      };
      const user = await entityUser.create<IUserModelWithId>(payloadUser);

      await entityWorkspace.findOneAndUpdate(
        { _id: workspaceId },
        {
          $push: {
            members: { id: user._id, permissions: tokenExist.permissions ?? [] }
          }
        }
      );

      const tokens = await generateJwtTokens({
        user,
        workspaceId: workspaceExists._id.toString()
      });
      res.status(201).json({ tokens } satisfies OutputPublicInvitationPost);

      await entity.remove(tokenExist._id);
    }
  });

import { isValidObjectId } from 'mongoose';

import { tokenInvitation as tokenInvit, company } from '@/models';
import { ICompanyModelWithId } from '@/models/company';
import { ITokenInvitationModelWithId } from '@/models/tokenInvitation';

import { OutputProtectedWorkspaceInvitationResendPut } from '@/interfaces/endpoints/protected/workspace/invitation/resend';
import { Entities, ErrorCodes, ReturnCodes, Roles } from '@/lib/enum';
import Exception from '@/lib/exception';
import { sendInvitationSignUpEmail } from '@/lib/jetmail';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    permissions: {
      put: {
        entity: Entities.WORKSPACE,
        permissions: [Roles.ADMIN, Roles.WRITE]
      }
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
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedWorkspaceInvitationResendPut"
     */
    put: async ({ account, params }, res) => {
      const { id } = params;

      if (!isValidObjectId(id)) {
        Exception.notValid(res, ErrorCodes.VALIDATION_ERROR);
        return;
      }
      const [token] = await tokenInvit.find<ITokenInvitationModelWithId>({
        _id: id,
        workspaceId: account.workspaceId
      });
      if (!token || !token.userEmail || !token.token) {
        Exception.notFound(res, ErrorCodes.INVITATION_NOT_FOUND);
        return;
      }

      const companyItem = await company.get<ICompanyModelWithId>(
        account.companyId ?? ''
      );

      res.json({
        code: ReturnCodes.INVITATION_SENT
      } satisfies OutputProtectedWorkspaceInvitationResendPut);
      sendInvitationSignUpEmail(
        token.userEmail,
        companyItem?.name ?? '',
        token.token
      ).catch(console.error);
      return;
    }
  });

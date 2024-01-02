import { isValidObjectId } from 'mongoose';
import isLength from 'validator/lib/isLength';

import { user as entity } from '@/models';
import { IUserModelWithId as IEntityModel } from '@/models/user';

import { OutputProtectedPasswordPut } from '@/interfaces/endpoints/protected/password';
import { encryptPassword, comparePassword } from '@/lib/encode';
import { ErrorCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    /**
     * @openapi
     * /protected/password/{id}:
     *  put:
     *    description: /password/{id}
     *    tags:
     *      - protected
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/InputProtectedUserPutBody"
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedUserPut"
     */
    put: async ({ body, account, params }, res) => {
      const { id } = params;
      const {
        password,
        newPassword
      }: { password: string; newPassword: string } = body;

      if (!account._id.equals(id)) {
        Exception.unauthorized(res, ErrorCodes.USER_NOT_AUTHORIZED);
        return;
      }

      if (!isValidObjectId(id)) {
        Exception.notValid(res);
        return;
      }

      const match = await comparePassword({
        password,
        encryptedPassword: account.password
      });
      if (!match) {
        Exception.notValid(res, ErrorCodes.PASSWORD_NOT_MATCH);
        return;
      }

      const valid = isLength(newPassword, { min: 6 });

      if (!valid) {
        Exception.notValid(res, ErrorCodes.PASSWORD_NOT_VALID);
        return;
      }

      const payload = {
        password: await encryptPassword(newPassword)
      };

      const user = await entity.update<IEntityModel>(id, payload);
      user.password = '';

      res.json({ user } satisfies OutputProtectedPasswordPut);
    }
  });

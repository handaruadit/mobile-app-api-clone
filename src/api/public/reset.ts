import { tokenPassword as tokenEntity, user } from '@/models';
import { ITokenModelWithId } from '@/models/tokenPassword';
import { IUserModelWithId } from '@/models/user';

import {
  OutputPublicResetGet,
  OutputPublicResetPost
} from '@/interfaces/endpoints/public/reset';
import { encryptPassword } from '@/lib/encode';
import { ErrorCodes, ReturnCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import { sendSuccesfullResetPasswordEmail } from '@/lib/jetmail';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    /**
     * @openapi
     * /public/reset:
     *  get:
     *    description: /reset
     *    tags:
     *      - public
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputPublicResetGet"
     */
    read: async ({ params }, res) => {
      const { id } = params;

      if (!id) {
        Exception.notValid(res, ErrorCodes.LINK_NOT_VALID);
        return;
      }

      const [token] = await tokenEntity.find<ITokenModelWithId>({
        token: id
      });

      if (!token) {
        Exception.notFound(res, ErrorCodes.LINK_NOT_FOUND);
        return;
      }
      res.status(200).json({
        token: {
          token: token.token,
          expireAt: token.expireAt
        }
      } satisfies OutputPublicResetGet);
    },

    /**
     * @openapi
     * /public/reset:
     *  post:
     *    description: /reset
     *    tags:
     *      - public
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/InputPublicResetPostBody"
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputPublicResetPost"
     */
    post: async ({ body }, res) => {
      const { token, password }: { token: string; password: string } = body;

      const [existToken] = await tokenEntity.find<ITokenModelWithId>({
        token
      });

      if (!existToken) {
        Exception.notFound(res, ErrorCodes.LINK_NOT_FOUND);
        return;
      }
      const [currentUser] = await user.find<IUserModelWithId>({
        _id: existToken.userId
      });

      if (!currentUser) {
        Exception.notFound(res, ErrorCodes.USER_NOT_FOUND);
        return;
      }

      const payload = {
        password: await encryptPassword(password)
      };

      await user.update(currentUser._id, payload);

      res.status(200).json({
        code: ReturnCodes.PASSWORD_RESET
      } satisfies OutputPublicResetPost);

      await sendSuccesfullResetPasswordEmail(currentUser).catch(console.error);
      await tokenEntity.remove(existToken._id);

      return;
    }
  });

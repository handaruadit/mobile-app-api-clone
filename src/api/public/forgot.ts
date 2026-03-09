import isEmail from 'validator/lib/isEmail';

import { user, tokenPassword } from '@/models';
import { ITokenModelWithId } from '@/models/tokenPassword';
import { IUserModelWithId } from '@/models/user';

import { OutputPublicForgotPost } from '@/interfaces/endpoints/public/forgot';
import { randomToken } from '@/lib/encode';
import { ReturnCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import { sendForgotPasswordEmail } from '@/lib/jetmail';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    /**
     * @openapi
     * /public/forgot:
     *  post:
     *    description: /forgot
     *    tags:
     *      - public
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/InputPublicForgotPostBody"
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputPublicForgotPost"
     */
    post: async ({ body }, res) => {
      const { email } = body;

      if (!isEmail(email)) {
        Exception.notValid(res);
        return;
      }

      const [existUser] = await user.find<IUserModelWithId>({
        email
      });

      if (!existUser) {
        Exception.notFound(res);
        return;
      }

      let [existToken] = await tokenPassword.find<ITokenModelWithId>({
        userId: existUser._id
      });

      if (!existToken) {
        const payload = {
          userId: existUser._id,
          token: randomToken()
        };

        existToken = await tokenPassword.create<ITokenModelWithId>(payload);
      }

      sendForgotPasswordEmail(existUser, existToken.token).catch(console.error);

      res.status(200).json({
        code: ReturnCodes.EMAIL_SENT
      } satisfies OutputPublicForgotPost);
      return;
    }
  });

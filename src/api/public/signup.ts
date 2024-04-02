import { user as entity } from '@/models';
import { IUserModelWithId } from '@/models/user';

import { OutputPublicSignupPost } from '@/interfaces/endpoints/public/signup';
import { encryptPassword } from '@/lib/encode';
// import { addContact, sendWelcomeEmail } from '@/lib/jetmail';
import { generateJwtTokens } from '@/lib/jwt';
import resource from '@/middleware/resource-router-middleware';
import exception from '@/lib/exception';
import isLength from 'validator/lib/isLength';
import { ReturnCodes } from '@/types';

export default () =>
  resource({
    /**
     * @openapi
     * /public/sighup:
     *  post:
     *    description: /signup
     *    tags:
     *      - public
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/InputPublicSignupPostBody"
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputPublicSignupPost"
     */
    post: async ({ body }, res) => {
      try {
        const {
          email,
          password,
          name
        }: { email: string; password: string; name: string } = body;
        // simple check
        const isLong = isLength(password, { min: 6 });

        if (!isLong) {
          exception.notValid(res, ReturnCodes.PASSWORD_NOT_LONG_ENOUGH);
          return;
        }

        const payload = {
          email,
          password: await encryptPassword(password),
          name
        };
        const user = await entity.create<IUserModelWithId>(payload);
  
        const tokens = await generateJwtTokens({ user });
  
        res.status(201).json({ tokens } satisfies OutputPublicSignupPost);
  
        // addContact(user).catch(console.error);
        // sendWelcomeEmail(user).catch(console.error);
      } catch (error) {
        exception.parseError(res, error);
        return;
      }
    }
  });

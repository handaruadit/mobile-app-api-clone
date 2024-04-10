// import { v4 as UUIDV4 } from 'uuid';
import isEmail from 'validator/lib/isEmail';
import isLength from 'validator/lib/isLength';

import { user as entity } from '@/models';
import { IUserModelWithId } from '@/models/user';
import { OutputPublicLoginPost } from '@/types';

import { comparePassword } from '@/lib/encode';
import { ErrorCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import { generateJwtTokens } from '@/lib/jwt';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    /**
     * @openapi
     * /public/login:
     *  post:
     *    description: /login
     *    tags:
     *      - public
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/InputPublicLoginPostBody"
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputPublicLoginPost"
     */
    post: async ({ body }, res) => {
      const { email, password } = body;
      const valid = isEmail(email) && isLength(password, { min: 6 });

      if (!valid) {
        Exception.notValid(res);
        return;
      }

      const [userData] = await entity.find<IUserModelWithId>({
        email
      });

      if (!userData) {
        Exception.notFound(res, ErrorCodes.USER_NOT_FOUND);
        return;
      }
      const match = await comparePassword({
        password,
        encryptedPassword: userData.password
      });

      if (!match) {
        Exception.notValid(res, ErrorCodes.PASSWORD_NOT_MATCH);
        return;
      }

      // const [company] = await entityCompany.find<ICompanyModelWithId>({
      //   ownerId: userData._id
      // });

      // if (!userData.crispTokenId) {
      //   try {
      //     const uuid = UUIDV4();
      //     await entity.update<IUserModelWithId>(userData._id, {
      //       crispTokenId: uuid
      //     });
      //     userData.crispTokenId = uuid;
      //   } catch (err) {
      //     /** avoid throw an error to client only because of Crisp. May need a better error handling */
      //     console.error('Failed to assign crispTokenId');
      //   }
      // }

      const tokens = await generateJwtTokens({
        user: userData
      });

      res.status(200).json({ tokens } satisfies OutputPublicLoginPost);
    }
  });

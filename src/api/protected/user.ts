import { Request } from 'express';
import { isValidObjectId } from 'mongoose';

import { user as entity } from '@/models';
import { IUserModelWithId as IEntityModel } from '@/models/user';
import {
  InputProtectedUserPutBody,
  OutputProtectedUserList,
  OutputProtectedUserPut
} from '@/types';

import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    /**
     * @openapi
     * /protected/user:
     *  get:
     *    description: /user
     *    tags:
     *      - protected
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedUserList"
     */
    list: ({ account }, res) => {
      const user = { ...account };
      user.password = '';
      res.json({ user } satisfies OutputProtectedUserList);
    },

    /**
     * @openapi
     * /protected/user/{id}:
     *  put:
     *    description: /user/{id}
     *    tags:
     *      - protected
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/InputProtectedPasswordPutBody"
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedPasswordPut"
     */
    put: async (
      { body, account, params }: Request & { body: InputProtectedUserPutBody },
      res
    ) => {
      const { id } = params;

      if (account._id.toString() !== id.toString()) {
        Exception.unauthorized(res);
        return;
      }

      if (!isValidObjectId(id)) {
        Exception.notValid(res);
        return;
      }

      const [item] = await entity.find<IEntityModel>({
        _id: id
      });

      if (!item) {
        Exception.notFound(res);
        return;
      }

      const payload = {
        name: body.name,
        email: body.email,
        job: body.job,
        _id: item._id,
        phoneNumber: body.phoneNumber,
        hasWhatsapp: body.hasWhatsapp,
        setting: {
          ...(body.setting ?? {})
        }
      };

      const updatedItem = await entity.update<IEntityModel>(id, payload);

      res.json({ user: updatedItem } satisfies OutputProtectedUserPut);
    }
  });

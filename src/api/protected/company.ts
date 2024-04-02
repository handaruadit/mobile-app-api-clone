import axios from 'axios';
import { isValidObjectId } from 'mongoose';

import { company as entity, workspace as workspaceEntity } from '@/models';
import { runTransaction } from '@/models/abstract';
import {
  ICompanyModelWithId as IEntityModel,
  ICompanyModelPayload as IEntityPayload
} from '@/models/company';
import {
  IWorkspaceModelWithId as IEntityModelWorkspace,
  IWorkspaceModelPayload
} from '@/models/workspace';

import {
  OutputProtectedCompanyDelete,
  OutputProtectedCompanyList,
  OutputProtectedCompanyPost,
  OutputProtectedCompanyPut
} from '@/interfaces/endpoints/protected/company';
import { ErrorCodes, ReturnCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';

export async function sendPaymentAccountCreation(
  urlApi: string,
  {
    name,
    companyId,
    country
  }: { name?: string; companyId: string; country?: string }
) {
  const accountResponse = await axios.post(
    urlApi,
    { name, companyId, country },
    {
      headers: {
        'x-runner': 'x-runner'
      }
    }
  );
  return accountResponse.data;
}

export default () =>
  resource({
    permissions: {
      put: {
        onlyCompanyOwner: true
      },
      delete: {
        onlyCompanyOwner: true
      }
    },

    /**
     * @openapi
     * /protected/company/{id}:
     *  get:
     *    description: /company/{id}
     *    tags:
     *      - protected
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedCompanyList"
     */
    list: async ({ account }, res) => {
      const company = await entity.get<IEntityModel>(account.companyId ?? '');
      if (!company) {
        Exception.empty(res);
        return;
      }
      res.json({ company } satisfies OutputProtectedCompanyList);
    },

    /**
     * @openapi
     * /protected/company:
     *  post:
     *    description: /company
     *    tags:
     *      - protected
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/InputProtectedCompanyPostBody"
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedCompanyPost"
     */
    post: async ({ account, body }, res) => {
      const { name, country, industry } = body;

      const alreadyExists = await entity.find({ ownerId: account._id });

      if (alreadyExists.length > 0) {
        Exception.conflict(res, ErrorCodes.COMPANY_ALREADY_EXISTS);
        return;
      }

      const payload: IEntityPayload = {
        name,
        country,
        industry,
        ownerId: account._id
      };
      const company = await entity.create<IEntityModel>(payload);

      const payloadWorkspace: IWorkspaceModelPayload = {
        name: company.name,
        language: 'en',
        timezone: 'UTC',
        members: [],
        ownerId: account._id
      };

      await workspaceEntity.create<IEntityModelWorkspace>(payloadWorkspace);

      // const payloadPayment = {
      //   name: company.name,
      //   email: account.email,
      //   companyId: company._id.toString(),
      //   country: company.country
      // };

      // const urlPaymentAccount = `${process.env.API_PAYMENT_URL}/account`;

      // await sendPaymentAccountCreation(urlPaymentAccount, payloadPayment);

      res.json({ company } satisfies OutputProtectedCompanyPost);
    },

    /**
     * @openapi
     * /protected/company/{id}:
     *  put:
     *    description: /company/{id}
     *    tags:
     *      - protected
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/InputProtectedCompanyPutBody"
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedCompanyPut"
     */
    put: async ({ body, params }, res) => {
      const { id } = params;

      if (!isValidObjectId(id)) {
        Exception.notValid(res, ErrorCodes.VALIDATION_ERROR);
        return;
      }

      const [item] = await entity.find<IEntityModel>({
        _id: id
      });
      if (!item) {
        Exception.notFound(res);
        return;
      }
      const payload: IEntityPayload = {
        ...body
      };
      const company = await entity.update<IEntityModel>(id, payload);
      res.json({ company } satisfies OutputProtectedCompanyPut);
    },

    /**
     * @openapi
     * /protected/company/{id}:
     *  delete:
     *    description: /company/{id}
     *    tags:
     *      - protected
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedCompanyDelete"
     */
    delete: async ({ account, params }, res) => {
      const { id } = params;

      if (!isValidObjectId(id)) {
        Exception.notValid(res, ErrorCodes.VALIDATION_ERROR);
        return;
      }

      const [item] = await entity.find<IEntityModel>({
        _id: id
      });
      if (!item) {
        Exception.notFound(res, ErrorCodes.COMPANY_NOT_FOUND);
        return;
      }

      const workspaces = await workspaceEntity.find<IEntityModelWorkspace>({
        companyId: id
      });

      const hasOnlyOwnerAsMember = workspaces.every((workspace) =>
        workspace.ownerId?.equals(account._id)
      );

      if (!hasOnlyOwnerAsMember) {
        Exception.forbidden(res, ErrorCodes.USER_NOT_AUTHORIZED);
        return;
      }

      // remove company and workspaces atomically
      const actions = [
        async () => {
          await entity.remove(id);
          return;
        },
        async () => {
          for (const workspace of workspaces) {
            await workspaceEntity.remove(workspace._id);
          }
        }
      ];
      await runTransaction(actions, () => {
        res.json({
          code: ReturnCodes.COMPANY_DELETED
        } satisfies OutputProtectedCompanyDelete);
      });
    }
  });

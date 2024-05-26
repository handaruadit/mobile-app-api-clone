import { Request } from 'express';

import { usersDevice } from '@/models';
import { IUsersDeviceModelWithId } from '@/models/usersDevice';

import {
  InputProtectedDeviceUpdateBody,
  OutputProtectedDeviceRead,
  OutputProtectedDeviceUpdate
} from '@/interfaces/endpoints/protected/usersDevice';
import { ErrorCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    /**
     * @openapi
     * /protected/users-device:
     *  get:
     *    description: Get Protected device
     *    tags:
     *      - Protected
     *    responses:
     *      200:
     *        description: OK
     *        content:
     *          application/json:
     *            schema:
     *              "$ref": "./components.yaml#/components/schemas/OutputProtectedDeviceRead"
     */
    list: async (
      { jwt }: Request, res
    ) => {
      try {
        const { deviceId } = jwt;

        if (!deviceId) {
          Exception.notValid(res, ErrorCodes.INVALID_ID);
          return;
        }

        // return updated data
        const result = await usersDevice.get<IUsersDeviceModelWithId>(deviceId);

        if (!result) {
          Exception.notValid(res, ErrorCodes.DEVICE_NOT_FOUND);
          return;
        }

        res.json({ device: { setting: result.setting || {} } } satisfies OutputProtectedDeviceRead);
      } catch (error) {
        Exception.parseError(res, error);
      }
    },
    /**
     * @openapi
     * /protected/device/{id}:
     *  put:
     *    description: Update a device
     *    tags:
     *      - Protected
     *    parameters:
     *      - name: id
     *        in: path
     *        description: ID of the device to update
     *        required: true
     *        schema:
     *          type: string
     *      - name: body
     *        in: body
     *        description: Updated device object
     *        required: true
     *        schema:
     *          "$ref": "./components.yaml#/components/schemas/InputProtectedDeviceUpdateBody"
     *    responses:
     *      200:
     *        description: OK
     *        content:
     *          application/json:
     *            schema:
     *              "$ref": "./components.yaml#/components/schemas/OutputProtectedDeviceUpdate"
     */
    put: async (
      {
        params,
        body
      }: Request & {
        body: InputProtectedDeviceUpdateBody;
      },
      res
    ) => {
      try {
        const { id } = params;
        const payload = body as InputProtectedDeviceUpdateBody;

        if (!id) {
          Exception.notValid(res, ErrorCodes.INVALID_ID);
          return;
        }

        await usersDevice.updateWhere(
          { uuid: id },
          {
            name: payload.name,
            versionName: payload.versionName,
            fcmToken: payload.fcmToken,
            setting: {
              geolocation: payload.setting?.geolocation,
              notifications: payload.setting?.notifications,
              darkMode: payload.setting?.darkMode,
              time24: payload.setting?.time24,
              language: payload.setting?.language
            }
          }
        );
        // return updated data
        const [result] = await usersDevice.find<IUsersDeviceModelWithId>({ uuid: id });

        res.json({ device: { setting: result.setting || {} } } satisfies OutputProtectedDeviceUpdate);
      } catch (error) {
        Exception.parseError(res, error);
      }
    }
  });

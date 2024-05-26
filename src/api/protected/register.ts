import { Request } from 'express';

import { usersDevice } from '@/models';
import { IUsersDeviceModelWithId, IUsersDeviceModelPayload } from '@/models/usersDevice';

import { OutputPublicRegisterCreate } from '@/interfaces/endpoints/public/register';
import { IPublicRegisterPayload } from '@/interfaces/output';
import { ErrorCodes } from '@/lib/enum';
import Exception from '@/lib/exception';
import {
  getDeviceIpInformation,
  ipbaseLocationToDeviceLocation,
  updateDeviceList
} from '@/lib/ipbase';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    /**
     * receive request body with device information
     * check if uuid doesn't exist then create new record with empty list.
     * if exist and ip doesn't exist in the list, then hit ip information API and append it to the list.
     */
    post: async (
      { body, account }: Request & { body: IPublicRegisterPayload },
      res
    ) => {
      try {
        const payload: IPublicRegisterPayload = body;
        const { uuid, ip } = payload;

        if (!uuid || !account._id) {
          Exception.notValid(res, ErrorCodes.INVALID_ID);
        }

        const [item] = await usersDevice.find<IUsersDeviceModelWithId>({ uuid });

        if (!item) {
          // Adding ip information is optional
          const [newLocation, error] = await getDeviceIpInformation(ip);
          const newDevice: IUsersDeviceModelPayload = {
            ...payload,
            name: payload.name ?? '',
            userId: account._id,
            setting: {}
          };

          if (newLocation && !error) {
            newDevice.location = ipbaseLocationToDeviceLocation(newLocation);
          }
          await usersDevice.create<IUsersDeviceModelWithId>(newDevice);
        }

        try {
          await usersDevice.find<IUsersDeviceModelWithId>({ uuid });
          // Check if the device is already following a masjid
        } catch (error) {
          console.log(error);
          //
        }

        const isADifferentIp = ip && item.location?.ip !== ip;
        if (isADifferentIp) {
          await updateDeviceList(ip, item);
        }

        res.json({ status: 'ok' } satisfies OutputPublicRegisterCreate);
      } catch (error) {
        Exception.parseError(res, error);
      }
    }
  });

import axios from 'axios';

import { usersDevice } from '@/models';
import { IUsersDeviceModelWithId } from '@/models/usersDevice';

import { IPublicRefreshPayload } from '@/interfaces/endpoints/protected/refresh';
import { OutputPublicDeviceInfoList } from '@/interfaces/endpoints/public/register';

import { ErrorCodes } from './enum';

/**
 * Retrieves device IP information from the IPBase API.
 * this won't throw error as it's by default an optional query.
 *
 * @param ip - The IP address to retrieve information for.
 * @returns A promise that resolves to an array containing the response data and any error.
 */
export const getDeviceIpInformation = async (ip: string): Promise<[response: OutputPublicDeviceInfoList | null, error: string | null]> => {
  try {
    const response = await axios.get<OutputPublicDeviceInfoList>(`https://api.ipbase.com/v2/info?apikey=${process.env.IPBASE_API_KEY}&ip=${ip}`);
    return [response.data, null];
  } catch (error) {
    console.error(error);
    return [null, ErrorCodes.GET_DEVICE_IP_INFORMATION_FAILED];
  }
};

export const ipbaseLocationToDeviceLocation = ({ data: newLocation }: OutputPublicDeviceInfoList) => {
  return {
    ip: newLocation.ip,
    country: newLocation.location?.country?.name,
    city: newLocation.location?.city?.name,
    state: newLocation.location?.country?.name,
    coordinates: {
      longitude: newLocation.location?.longitude,
      latitude: newLocation.location?.latitude
    },
    timezone: newLocation.timezone?.id
  };
};

export const updateDeviceList = async (ip: string, data: IUsersDeviceModelWithId, payload?: IPublicRefreshPayload) => {
  const [newLocation, error] = await getDeviceIpInformation(ip);
  let updated: IUsersDeviceModelWithId | null = null;

  if (newLocation) {
    updated = await usersDevice.update(data._id, {
      ...(payload ? payload : {}),
      location: ipbaseLocationToDeviceLocation(newLocation)
    });
  }
  return [updated, error];
};

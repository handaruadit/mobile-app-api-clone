import { isValidObjectId } from 'mongoose';

export const flattenObject = (obj: Record<string, any>, prefix = '') => {
  return Object.keys(obj).reduce((acc: Record<string, any>, k) => {
    const pre = prefix.length ? prefix + '.' : '';

    if (!isValidObjectId(obj[k]) && typeof obj[k] === 'object' && obj[k] && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      const newKey = pre + k;
      acc[newKey] = obj[k];
    }

    return acc;
  }, {});
};

/**
 * Check if parameters given is valid
 * @param offset
 * @param page
 * @param limit
 * @returns boolean
 */
export const isInvalidPaginateParams = (offset: number | undefined, page: number, limit: number): boolean => {
  return (offset && Number(offset) < 0) || Number(page) <= 0 || !Number(page) || Number(limit) < 0;
};

/**
 * Check if latitude and longitude are valid
 * @param latitude
 * @param longitude
 * @returns boolean
 */
export const isValidLatLong = (latitude: number, longitude: number): boolean => {
  // Check if latitude is within valid range
  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    return false;
  }

  // Check if longitude is within valid range
  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    return false;
  }

  return true;
};

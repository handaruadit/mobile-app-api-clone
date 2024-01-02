import { isValidObjectId } from 'mongoose';

export const flattenObject = (obj: Record<string, any>, prefix = '') => {
  return Object.keys(obj).reduce((acc: Record<string, any>, k) => {
    const pre = prefix.length ? prefix + '.' : '';

    if (
      !isValidObjectId(obj[k]) &&
      typeof obj[k] === 'object' &&
      obj[k] &&
      !Array.isArray(obj[k])
    ) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      const newKey = pre + k;
      acc[newKey] = obj[k];
    }

    return acc;
  }, {});
};

import type { Types } from 'mongoose';

export type StringIds<T> = T extends Types.ObjectId
  ? string
  : T extends NativeDate
  ? string
  : T extends Record<any, any>
  ? {
      [K in keyof T]: StringIds<T[K]>;
    }
  : T;

export type AvailabilityType = 'online' | 'offline' | 'unlinked';

export type ITimeseriesAggregate = 'realtime' | 'minute' | 'hour' | 'day' | 'week';

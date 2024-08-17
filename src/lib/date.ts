import { ITimeseriesAggregate } from '@/types';
import moment from 'moment';

export function getLastThreeMonths(): string[] {
  const months = [];
  for (let i = 2; i > -1; i--) {
    months.push(moment().subtract(i, 'months').format('MMMM'));
  }
  return months;
}

export const determineTimeAggregate = (start: Date, end: Date, timezone?: string): ITimeseriesAggregate => {
  const diffInMinutes = moment(end).diff(moment(start), 'minutes');
  timezone; // for future use

  if (diffInMinutes <= 30) {
    return 'realtime';
  } else if (diffInMinutes <= 24 * 60) {
    return 'hour';
  } else if (diffInMinutes <= 7 * 24 * 60) {
    return 'day';
  } else {
    return 'week';
  }
};

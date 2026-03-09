import { Types } from 'mongoose';

import { ITimeseriesAggregate } from '@/types';
import BatteryStats from './BatteryDataProcessor';
import PanelStats from './PanelDataProcessor';
import InverterStats from './InverterDataProcessor';
import { IMainStatsOptions } from './DataProcessor';

export default class TimeseriesProcessor {
  aggregate: ITimeseriesAggregate;
  timezone = 'Asia/Jakarta';
  deviceIds: (string | Types.ObjectId)[];

  constructor(deviceIds: (string | Types.ObjectId)[], aggregate: ITimeseriesAggregate = 'realtime', timezone = 'Asia/Jakarta') {
    this.deviceIds = deviceIds;
    this.aggregate = aggregate;
    this.timezone = timezone;
  }

  /**
   * NOT OPTIMAL. It will be good if it's retrieved in one mongoose query
   * should give data about:
   * - power generated (required) / panel
   * - power usage / inverter out
   * - battery charged / current in
   * - battery out / current out
   *
   * @param startTime
   * @param endTime
   *
   * return:
   * [
   *  {
   *    powerGenerated: number,
   *    powerUsage: number,
   *    batteryCharged: number,
   *    batteryOut: number,
   *    // where time strings could be months like 'January', 'February', or week of month like '07 July', '14 July'
   *    time: string | Date
   *  }
   * ]
   */
  async getTimeseriesStats({ startTime, endTime, round = 4 }: IMainStatsOptions) {
    const batteryProcessor = new BatteryStats(this.deviceIds);
    const inverterProcessor = new InverterStats(this.deviceIds);
    const panelProcessor = new PanelStats(this.deviceIds);
    const rawData = await Promise.all([
      batteryProcessor.getTimeseriesStats({ startTime, endTime }),
      inverterProcessor.getTimeseriesStats({ startTime, endTime }),
      panelProcessor.getTimeseriesStats({ startTime, endTime })
    ]);

    const groupedData: { [key: string]: any } = {};

    rawData.forEach(dataArray => {
      dataArray.forEach(data => {
        const time = data.time as string;
        if (!groupedData[time]) {
          groupedData[time] = { time };
        }
        Object.assign(groupedData[time], data);
      });
    });

    return Object.values(groupedData).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }
}

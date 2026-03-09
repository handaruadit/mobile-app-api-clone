import moment from 'moment';
import { DataProcessor, DataStats, IMainStatsOptions } from './DataProcessor';
import { panelData } from '@/models';
import { IPanelDataModelWithId } from '@/models/panelData';
import { FilterQuery, Types } from 'mongoose';
import { ITimeseriesAggregate, OutputMainPanelData, OutputTimeseriesPanelData } from '@/types';
import panelAggregate, { IPanelDataAggregate } from '@/models/panelAggregate';

export default class PanelStats implements DataStats {
  private _timezone = 'Asia/Jakarta';
  deviceIds: (string | Types.ObjectId)[];
  dataProcessor: DataProcessor;
  aggregate: ITimeseriesAggregate;

  constructor(deviceIds: (string | Types.ObjectId)[], aggregate?: ITimeseriesAggregate) {
    this.deviceIds = deviceIds;
    this.aggregate = aggregate ?? 'realtime';
  }

  // Power related methods
  getPower(dataProcessor: DataProcessor) {
    const totalEnergy = dataProcessor.calculateTotalWithDeltaTime('power');
    return totalEnergy;
  }

  getAvgPower(dataProcessor: DataProcessor) {
    const totalEnergy = this.getPower(dataProcessor);
    const totalTimeSeconds = dataProcessor.getTotalTimeSeconds();
    return totalEnergy / totalTimeSeconds; // Returns average power in watts
  }

  // Current related methods
  getCurrent(dataProcessor: DataProcessor) {
    const totalCurrentCoulombs = dataProcessor.calculateTotalWithDeltaTime('current');
    const totalTimeSeconds = 3600; // Assuming the data is for one hour
    return totalCurrentCoulombs / totalTimeSeconds; // Returns current in ampere hour
  }

  getAvgCurrent(dataProcessor: DataProcessor) {
    const totalCurrent = dataProcessor.calculateTotalWithDeltaTime('current');
    const totalTimeSeconds = dataProcessor.getTotalTimeSeconds();
    return totalCurrent / totalTimeSeconds; // Returns average current in amperes
  }

  // Voltage related methods
  getVoltage(dataProcessor: DataProcessor) {
    const volt = dataProcessor.addTotalData('voltage');
    return volt;
  }

  getAvgVoltage(dataProcessor: DataProcessor) {
    const totalVoltage = dataProcessor.addTotalData('voltage');
    const dataPointsCount = dataProcessor.getDataLength();
    return totalVoltage / dataPointsCount; // Returns average voltage in volts
  }

  async getDataProcessor({ timezone, days, hours }: IMainStatsOptions) {
    timezone = timezone ?? this._timezone;
    const todayStart = moment().tz(timezone).subtract(days, 'days').startOf('day');
    const daysFilter = { $gte: todayStart.toDate() };
    const hoursFilter = hours ? { $gte: moment().tz(timezone).subtract(hours, 'hours').toDate() } : undefined;
    const data = await panelData.find<IPanelDataModelWithId>({
      createdAt: hours ? hoursFilter : daysFilter,
      deviceId: { $in: this.deviceIds }
    });
    this.dataProcessor = new DataProcessor(data);
    return this.dataProcessor;
  }

  async getMainStats(options: IMainStatsOptions): Promise<OutputMainPanelData> {
    const dataProcessor = this.dataProcessor ? this.dataProcessor : await this.getDataProcessor(options);

    if (!dataProcessor) {
      throw Error('Failed to get Data Processor');
    }

    return {
      totalEnergyGenerated: this.getPower(dataProcessor),
      totalCurrent: this.getCurrent(dataProcessor),
      totalVoltage: this.getVoltage(dataProcessor),
      avgCurrent: this.getAvgCurrent(dataProcessor),
      avgPower: this.getAvgPower(dataProcessor),
      avgVoltage: this.getAvgVoltage(dataProcessor)
    };
  }

  /**
   * should give data about:
   * - power generated (required) / panel
   * - power usage / inverter out
   * - battery charged / current in
   * - battery out / current out
   * */
  async getTimeseriesStats({ startTime, endTime, round = 4 }: IMainStatsOptions): Promise<OutputTimeseriesPanelData[]> {
    const filter: FilterQuery<any> = {
      createdAt: { $gte: startTime, $lte: endTime },
      deviceId: { $in: this.deviceIds }
    };
    let result: OutputTimeseriesPanelData[] = [];
    if (this.aggregate == 'realtime') {
      const timeData = '$createdAt';
      result = await panelData.model.aggregate([
        { $match: filter },
        // We removed milisecond and timezone in the date
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%dT%H:%M:%S',
                date: {
                  $dateFromParts: {
                    year: { $year: timeData },
                    month: { $month: timeData },
                    day: { $dayOfMonth: timeData },
                    hour: { $hour: timeData },
                    minute: { $minute: timeData },
                    second: { $second: timeData }
                  }
                }
              }
            },
            powerGenerated: {
              $sum: { $round: ['$power', round] }
            }
          }
        },
        {
          $project: {
            _id: 0,
            time: '$_id',
            powerGenerated: 1
          }
        }
      ]);
    } else {
      // use hourly aggregate
      const model = this.getAggregateModel();
      const aggregate = await model.find<IPanelDataAggregate>(filter);
      result = aggregate.map(
        data =>
          ({
            time: data.sentAt,
            powerGenerated: data.totalPower != null ? parseFloat(data.totalPower.toFixed(4)) : data.totalPower
          } as OutputTimeseriesPanelData)
      );
    }

    return result;
  }

  getAggregateModel(
    aggregate?: ITimeseriesAggregate
  ): typeof panelAggregate.minuteModel | typeof panelAggregate.hourlyModel | typeof panelAggregate.dailyModel | typeof panelAggregate.weeklyModel {
    switch (aggregate ?? this.aggregate) {
      case 'minute':
        return panelAggregate.minuteModel;
      case 'hour':
        return panelAggregate.hourlyModel;
      case 'day':
        return panelAggregate.dailyModel;
      case 'week':
        return panelAggregate.weeklyModel;
      default:
        return panelAggregate.minuteModel;
    }
  }
  async aggregateMinuteData() {
    const aggregate = await panelAggregate.getMinuteDataAggregate();
    const lastMinuteAggregate = aggregate[aggregate.length - 1];
    const identifier = {
      workspaceId: lastMinuteAggregate._id.workspaceId.toString(),
      deviceId: lastMinuteAggregate._id.deviceId.toString(),
      year: lastMinuteAggregate._id.year,
      month: lastMinuteAggregate._id.month,
      day: lastMinuteAggregate._id.day,
      hour: lastMinuteAggregate._id.hour,
      minute: lastMinuteAggregate._id.minute,
      timestamp: new Date(
        lastMinuteAggregate._id.year,
        lastMinuteAggregate._id.month - 1,
        lastMinuteAggregate._id.day,
        lastMinuteAggregate._id.hour,
        lastMinuteAggregate._id.minute,
        0,
        0
      )
    };
    delete lastMinuteAggregate._id;
    panelAggregate.minuteModel.create({
      ...identifier,
      ...lastMinuteAggregate
    });

    return true;
  }
  async aggregateHourlyData() {
    const aggregate = await panelAggregate.getHourlyDataAggregate();
    const lastHourAggregate = aggregate[aggregate.length - 1];
    const identifier = {
      workspaceId: lastHourAggregate._id.workspaceId.toString(),
      deviceId: lastHourAggregate._id.deviceId.toString(),
      year: lastHourAggregate._id.year,
      month: lastHourAggregate._id.month,
      day: lastHourAggregate._id.day,
      hour: lastHourAggregate._id.hour,
      timestamp: new Date(lastHourAggregate._id.year, lastHourAggregate._id.month - 1, lastHourAggregate._id.day, lastHourAggregate._id.hour, 0, 0, 0)
    };
    delete lastHourAggregate._id;
    lastHourAggregate.timestamp = identifier.timestamp;
    panelAggregate.hourlyModel.create({
      ...identifier,
      ...lastHourAggregate
    });

    return true;
  }
  async aggregateDailyData() {
    const aggregate = await panelAggregate.getDailyDataAggregate();
    const lastDayAggregate = aggregate[aggregate.length - 1];
    const identifier = {
      workspaceId: lastDayAggregate._id.workspaceId.toString(),
      deviceId: lastDayAggregate._id.deviceId.toString(),
      year: lastDayAggregate._id.year,
      month: lastDayAggregate._id.month,
      day: lastDayAggregate._id.day,
      timestamp: new Date(lastDayAggregate._id.year, lastDayAggregate._id.month - 1, lastDayAggregate._id.day, 0, 0, 0, 0)
    };
    delete lastDayAggregate._id;
    lastDayAggregate.timestamp = identifier.timestamp;
    panelAggregate.dailyModel.create({
      ...identifier,
      ...lastDayAggregate
    });

    return true;
  }
  async aggregateWeeklyData() {
    const aggregate = await panelAggregate.getWeeklyDataAggregate();
    const lastDayAggregate = aggregate[aggregate.length - 1];
    const identifier = {
      workspaceId: lastDayAggregate._id.workspaceId.toString(),
      deviceId: lastDayAggregate._id.deviceId.toString(),
      year: lastDayAggregate._id.year,
      month: lastDayAggregate._id.month,
      week: lastDayAggregate._id.week,
      timestamp: new Date(lastDayAggregate._id.year, lastDayAggregate._id.month - 1, 0, 0, 0, 0, 0)
    };
    delete lastDayAggregate._id;
    lastDayAggregate.timestamp = identifier.timestamp;
    panelAggregate.weeklyModel.create({
      ...identifier,
      ...lastDayAggregate
    });

    return true;
  }
}

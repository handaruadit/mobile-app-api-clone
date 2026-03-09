import { DataProcessor, DataStats, IMainStatsOptions } from './DataProcessor';
import { batteryAggregate, batteryData } from '@/models';
import { IBatteryDataModelWithId } from '@/models/batteryData';
import { FilterQuery, Types } from 'mongoose';
import { OutputMainBatteryData, ITimeseriesAggregate, OutputTimeseriesBatteryData, ISitesData } from '@/types';
import moment from 'moment';
import { IBatteryDataAggregate } from '@/models/batteryAggregate';

export default class BatteryStats implements DataStats {
  private _timezone = 'Asia/Jakarta';
  deviceIds: (string | Types.ObjectId)[];
  dataProcessor: DataProcessor;
  aggregate: ITimeseriesAggregate;

  constructor(deviceIds: (string | Types.ObjectId)[], aggregate?: ITimeseriesAggregate) {
    this.deviceIds = deviceIds;
    this.aggregate = aggregate ?? 'realtime';
  }

  // Current related methods
  getCurrent(dataProcessor: DataProcessor) {
    const totalCurrentCoulombs = dataProcessor.calculateSource('current');
    const totalTimeSeconds = 3600; // Assuming the data is for one hour
    return totalCurrentCoulombs / totalTimeSeconds; // Returns current in amperes
  }

  getAvgCurrent(dataProcessor: DataProcessor) {
    const totalCurrent = dataProcessor.calculateSource('current');
    const totalTimeSeconds = dataProcessor.getTotalTimeSeconds();
    return totalCurrent / totalTimeSeconds; // Returns average current in amperes
  }

  getTotalChargeCapacity(dataProcessor: DataProcessor) {
    return dataProcessor.calculateSource('current', true);
  }

  getTotalCharged(dataProcessor: DataProcessor) {
    const current = dataProcessor.calculateSource('current', true);
    const voltage = this.getVoltage(dataProcessor);
    return current * voltage;
  }

  getTotalDischarged(dataProcessor: DataProcessor) {
    const current = dataProcessor.calculateSource('current', false);
    const voltage = this.getVoltage(dataProcessor);
    return current * voltage;
  }

  // Voltage related methods
  getVoltage(dataProcessor: DataProcessor) {
    const volt = dataProcessor.addTotalData('voltage');
    return volt;
  }

  getAvgVoltage(dataProcessor: DataProcessor) {
    const totalVoltage = dataProcessor.calculateSource('voltage');
    const dataPointsCount = dataProcessor.getDataLength();
    return totalVoltage / dataPointsCount; // Returns average voltage in volts
  }

  // Power related methods
  getPower(dataProcessor: DataProcessor) {
    const voltage = this.getVoltage(dataProcessor);
    const current = this.getCurrent(dataProcessor); // Use current in ampere-hours
    return (voltage * current) / 1000; // Convert to kilowatt-hours
  }

  getAvgPower(dataProcessor: DataProcessor) {
    const totalEnergy = this.getTotalEnergyCapacity(dataProcessor);
    const totalTimeSeconds = dataProcessor.getTotalTimeSeconds();
    return totalEnergy / totalTimeSeconds; // Returns average power in watts
  }

  // Energy related methods
  getTotalEnergyCapacity(dataProcessor: DataProcessor) {
    return dataProcessor.calculateSource('current', true);
  }

  // Data processing methods
  async getDataProcessor({ timezone, days, hours, source = 'default' }: IMainStatsOptions) {
    timezone = timezone ?? this._timezone;
    const todayStart = moment().tz(timezone).subtract(days, 'days').startOf('day');
    const daysFilter = { $gte: todayStart.toDate() };
    const hoursFilter = hours ? { $gte: moment().tz(timezone).subtract(hours, 'hours').toDate() } : undefined;
    let data: Partial<IBatteryDataModelWithId & IBatteryDataAggregate>[];

    if (source === 'default') {
      data = await batteryData.find<IBatteryDataModelWithId>({
        createdAt: hours ? hoursFilter : daysFilter,
        deviceId: { $in: this.deviceIds }
      });
    } else {
      const aggregateData = await batteryAggregate.minuteModel.find({
        deviceId: { $in: this.deviceIds },
        timestamp: hours ? hoursFilter : daysFilter
      });

      data = aggregateData.map(item => ({
        ...item,
        power: item.avgPower,
        current: item.avgCurrent,
        voltage: item.avgVoltage,
        charged: item.totalCharged,
        discharged: item.totalDischarged
      }));
    }
    this.dataProcessor = new DataProcessor(data as ISitesData[]);
    return this.dataProcessor;
  }

  async getMainStats(options: IMainStatsOptions): Promise<OutputMainBatteryData> {
    const dataProcessor = this.dataProcessor ? this.dataProcessor : await this.getDataProcessor(options);

    if (!dataProcessor) {
      throw Error('Failed to get Data Processor');
    }

    return {
      totalPower: this.getPower(dataProcessor),
      totalCurrent: this.getCurrent(dataProcessor),
      totalVoltage: this.getVoltage(dataProcessor),
      totalCharged: this.getTotalCharged(dataProcessor),
      totalDischarged: this.getTotalDischarged(dataProcessor),
      totalChargedCapacity: this.getTotalChargeCapacity(dataProcessor),
      totalEnergyCapacity: this.getTotalEnergyCapacity(dataProcessor),
      avgPower: this.getAvgPower(dataProcessor),
      avgCurrent: this.getAvgCurrent(dataProcessor),
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
  async getTimeseriesStats({ startTime, endTime, round = 4 }: IMainStatsOptions): Promise<OutputTimeseriesBatteryData[]> {
    const filter: FilterQuery<any> = {
      createdAt: { $gte: startTime, $lte: endTime },
      deviceId: { $in: this.deviceIds }
    };
    let result: OutputTimeseriesBatteryData[] = [];
    if (this.aggregate == 'realtime') {
      result = await batteryData.model.aggregate([
        { $match: filter },
        // We removed milisecond and timezone in the date
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%dT%H:%M:%S',
                date: {
                  $dateFromParts: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                    hour: { $hour: '$createdAt' },
                    minute: { $minute: '$createdAt' },
                    second: { $second: '$createdAt' }
                  }
                }
              }
            },
            discharged: {
              $sum: {
                $cond: {
                  if: { $lt: ['$current', 0] },
                  then: { $round: ['$power', round] },
                  else: 0
                }
              }
            },
            charged: {
              $sum: {
                $cond: {
                  if: { $gt: ['$current', 0] },
                  then: { $round: ['$power', round] },
                  else: 0
                }
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            time: '$_id',
            discharged: 1,
            charged: 1
          }
        }
      ]);
    } else {
      // use hourly aggregate
      const model = this.getAggregateModel();
      const aggregate = await model.find<IBatteryDataAggregate>(filter);
      result = aggregate.map(
        data =>
          ({
            time: data.sentAt,
            charged: data.totalCharged != null ? parseFloat(data.totalCharged.toFixed(4)) : data.totalCharged,
            discharged: data.totalDischarged != null ? parseFloat(data.totalDischarged.toFixed(4)) : data.totalDischarged
          } as OutputTimeseriesBatteryData)
      );
    }

    return result;
  }

  getAggregateModel(
    aggregate?: ITimeseriesAggregate
  ): typeof batteryAggregate.minuteModel | typeof batteryAggregate.hourlyModel | typeof batteryAggregate.dailyModel | typeof batteryAggregate.weeklyModel {
    switch (aggregate ?? this.aggregate) {
      case 'minute':
        return batteryAggregate.minuteModel;
      case 'hour':
        return batteryAggregate.hourlyModel;
      case 'day':
        return batteryAggregate.dailyModel;
      case 'week':
        return batteryAggregate.weeklyModel;
      default:
        return batteryAggregate.minuteModel;
    }
  }

  async aggregateMinuteData() {
    const aggregate = await batteryAggregate.getMinuteDataAggregate();
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
    batteryAggregate.minuteModel.create({
      ...identifier,
      ...lastMinuteAggregate
    });

    return true;
  }

  async aggregateHourlyData() {
    const aggregate = await batteryAggregate.getHourlyDataAggregate();
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
    batteryAggregate.hourlyModel.create({
      ...identifier,
      ...lastHourAggregate
    });

    return true;
  }
  async aggregateDailyData() {
    const aggregate = await batteryAggregate.getDailyDataAggregate();
    const lastDailyAggregate = aggregate[aggregate.length - 1];

    const timestamp = new Date(lastDailyAggregate._id.year, lastDailyAggregate._id.month - 1, lastDailyAggregate._id.day, lastDailyAggregate._id.hour, 0, 0, 0);

    const identifier = {
      workspaceId: lastDailyAggregate._id.workspaceId.toString(),
      deviceId: lastDailyAggregate._id.deviceId.toString(),
      year: lastDailyAggregate._id.year,
      month: lastDailyAggregate._id.month,
      day: lastDailyAggregate._id.day,
      timestamp: timestamp
    };

    delete lastDailyAggregate._id;
    await batteryAggregate.dailyModel.create({
      ...identifier,
      ...lastDailyAggregate
    });

    return true;
  }

  async aggregateWeeklyData() {
    const aggregate = await batteryAggregate.getWeeklyDataAggregate();
    const lastWeeklyAggregate = aggregate[aggregate.length - 1];

    const timestamp = new Date(
      lastWeeklyAggregate._id.year,
      lastWeeklyAggregate._id.month - 1,
      lastWeeklyAggregate._id.day,
      lastWeeklyAggregate._id.hour,
      0,
      0,
      0
    );

    const identifier = {
      workspaceId: lastWeeklyAggregate._id.workspaceId.toString(),
      deviceId: lastWeeklyAggregate._id.deviceId.toString(),
      year: lastWeeklyAggregate._id.year,
      month: lastWeeklyAggregate._id.month,
      day: lastWeeklyAggregate._id.day,
      timestamp: timestamp
    };

    delete lastWeeklyAggregate._id;
    await batteryAggregate.weeklyModel.create({
      ...identifier,
      ...lastWeeklyAggregate
    });

    return true;
  }
}

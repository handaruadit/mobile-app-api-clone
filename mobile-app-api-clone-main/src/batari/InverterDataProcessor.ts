import moment from 'moment';
import { DataProcessor, DataStats, IMainStatsOptions } from './DataProcessor';
import { inverterData } from '@/models';
import { IInverterDataModelWithId } from '@/models/inverterData';
import { FilterQuery, Types } from 'mongoose';
import { ITimeseriesAggregate, OutputTimeseriesInverterData, ISitesData, StatsOutput } from '@/types';
import inverterAggregate, { IInverterDataAggregate } from '@/models/inverterAggregate';

export default class InverterStats implements DataStats {
  private _timezone = 'Asia/Jakarta';
  deviceIds: (string | Types.ObjectId)[];
  dataProcessor: DataProcessor;
  aggregate: ITimeseriesAggregate;

  constructor(deviceIds: (string | Types.ObjectId)[], aggregate?: ITimeseriesAggregate) {
    this.deviceIds = deviceIds;
    this.aggregate = aggregate ?? 'realtime';
  }

  getConsumption(dataProcessor: DataProcessor) {
    const totalEnergyWattSeconds = dataProcessor.calculateSource('acPowerOut');
    // Convert watt-seconds to kilowatt-hours
    return totalEnergyWattSeconds / (1000 * 3600); // total_energy_kwh
  }

  getEnergyFromGrid(dataProcessor: DataProcessor) {
    const totalEnergyWattSeconds = dataProcessor.calculateSource('acPowerIn');
    // Convert watt-seconds to kilowatt-hours
    return totalEnergyWattSeconds / (1000 * 3600); // total_energy_kwh
  }

  async getDataProcessor({ timezone, days, hours, source = 'default' }: IMainStatsOptions) {
    timezone = timezone ?? this._timezone;
    const todayStart = moment().tz(timezone).subtract(days, 'days').startOf('day');
    const daysFilter = { $gte: todayStart.toDate() };
    const hoursFilter = hours ? { $gte: moment().tz(timezone).subtract(hours, 'hours').toDate() } : undefined;

    let data: Partial<IInverterDataModelWithId & IInverterDataAggregate>[];
    if (source === 'default') {
      data = await inverterData.find<IInverterDataModelWithId>({
        createdAt: hours ? hoursFilter : daysFilter,
        deviceId: { $in: this.deviceIds }
      });
    } else {
      const aggregateData = await inverterAggregate.minuteModel
        .find<IInverterDataAggregate & { _id: Types.ObjectId }>({
          createdAt: hours ? hoursFilter : daysFilter,
          deviceId: { $in: this.deviceIds }
        })
        .lean();
      data = aggregateData.map(item => ({
        ...item,
        power: item.avgAcPowerOut,
        siteId: item.workspaceId,
        acVoltageIn: item.avgAcVoltageIn,
        acVoltageOut: item.avgAcVoltageOut,
        acPowerIn: item.totalAcPowerIn,
        acPowerOut: item.totalAcPowerOut,
        acCurrentIn: item.avgAcCurrentIn,
        acCurrentOut: item.avgAcCurrentOut
      }));
    }

    this.dataProcessor = new DataProcessor(data as ISitesData[]);
    return this.dataProcessor;
  }

  async getMainStats(options: IMainStatsOptions): Promise<StatsOutput> {
    const dataProcessor = this.dataProcessor ? this.dataProcessor : await this.getDataProcessor(options);

    if (!dataProcessor) {
      throw Error('Failed to get Data Processor');
    }

    return {
      consumption: this.getConsumption(dataProcessor),
      energyFromGrid: this.getEnergyFromGrid(dataProcessor)
    };
  }

  /**
   * should give data about:
   * - power generated (required) / panel
   * - power usage / inverter out
   * - battery charged / current in
   * - battery out / current out
   * */
  async getTimeseriesStats({ startTime, endTime, round = 4 }: IMainStatsOptions): Promise<OutputTimeseriesInverterData[]> {
    const filter: FilterQuery<any> = {
      createdAt: { $gte: startTime, $lte: endTime },
      deviceId: { $in: this.deviceIds }
    };
    let result: OutputTimeseriesInverterData[] = [];
    if (this.aggregate == 'realtime') {
      const timeData = '$createdAt';
      result = await inverterData.model.aggregate([
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
            powerUsage: {
              $sum: { $round: ['$acPowerOut', round] }
            },
            chargedFromGrid: {
              $sum: { $round: ['$acPowerIn', round] }
            }
          }
        },
        {
          $project: {
            _id: 0,
            time: '$_id',
            powerUsage: 1,
            chargedFromGrid: 1
          }
        }
      ]);
    } else {
      // use hourly aggregate
      const model = this.getAggregateModel();
      const aggregate = await model.find<IInverterDataAggregate>(filter);
      result = aggregate.map(
        data =>
          ({
            time: data.sentAt,
            powerUsage: data.totalAcPowerOut != null ? parseFloat(data.totalAcPowerOut.toFixed(4)) : data.totalAcPowerOut,
            chargedFromGrid: data.totalAcPowerIn != null ? parseFloat(data.totalAcPowerIn.toFixed(4)) : data.totalAcPowerIn
          } as OutputTimeseriesInverterData)
      );
    }

    return result;
  }

  getAggregateModel(
    aggregate?: ITimeseriesAggregate
  ): typeof inverterAggregate.minuteModel | typeof inverterAggregate.hourlyModel | typeof inverterAggregate.dailyModel | typeof inverterAggregate.weeklyModel {
    switch (aggregate ?? this.aggregate) {
      case 'minute':
        return inverterAggregate.minuteModel;
      case 'hour':
        return inverterAggregate.hourlyModel;
      case 'day':
        return inverterAggregate.dailyModel;
      case 'week':
        return inverterAggregate.weeklyModel;
      default:
        return inverterAggregate.minuteModel;
    }
  }

  async aggregateMinuteData() {
    const aggregate = await inverterAggregate.getMinuteDataAggregate();
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
    inverterAggregate.minuteModel.create({
      ...identifier,
      ...lastMinuteAggregate
    });

    return true;
  }
  async aggregateHourlyData() {
    const aggregate = await inverterAggregate.getHourlyDataAggregate();
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
    inverterAggregate.hourlyModel.create({
      ...identifier,
      ...lastHourAggregate
    });

    return true;
  }
  async aggregateDailyData() {
    const aggregate = await inverterAggregate.getDailyDataAggregate();
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
    inverterAggregate.dailyModel.create({
      ...identifier,
      ...lastDayAggregate
    });

    return true;
  }
  async aggregateWeeklyData() {
    const aggregate = await inverterAggregate.getWeeklyDataAggregate();
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
    inverterAggregate.weeklyModel.create({
      ...identifier,
      ...lastDayAggregate
    });

    return true;
  }
}

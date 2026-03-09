import { InferSchemaType, Schema, Types, model } from 'mongoose';
import moment from 'moment';
import DataAggregator from './DataAggregator';
import batteryInstance from './batteryData';

const field = {
  timestamp: {
    type: Date,
    required: true
  },
  workspaceId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Workspace'
  },
  deviceId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Device'
  },
  metadata: { type: Object },

  maxVolt: Number,
  minVolt: Number,
  avgVolt: Number,
  totalVolt: Number,

  minPower: Number,
  maxPower: Number,
  avgPower: Number,
  totalPower: Number,

  minCurrent: Number,
  maxCurrent: Number,
  avgCurrent: Number,
  totalCurrent: Number,

  minHumidity: Number,
  maxHumidity: Number,
  avgHumidity: Number,

  minTemperature: Number,
  maxTemperature: Number,
  avgTemperature: Number,
  totalTemperature: Number,

  totalEnergy: Number,
  totalCharged: Number,
  totalDischarged: Number,

  dataPoints: Number,
  year: Number,
  month: Number,
  week: Number,
  day: Number,
  hour: Number,
  minute: Number,
  sentAt: {
    type: Date,
    required: true,
    default: new Date()
  }
};

const timeSchema = {
  weeklySchema: new Schema(field, {
    timestamps: true,
    timeseries: {
      timeField: 'sentAt',
      metaField: 'metadata',
      granularity: 'weeks'
    }
  }),
  dailySchema: new Schema(field, {
    timestamps: true,
    timeseries: {
      timeField: 'sentAt',
      metaField: 'metadata',
      granularity: 'days'
    }
  }),
  hourlySchema: new Schema(field, {
    timestamps: true,
    timeseries: {
      timeField: 'sentAt',
      metaField: 'metadata',
      granularity: 'hours'
    }
  }),
  minuteSchema: new Schema(field, {
    timestamps: true,
    timeseries: {
      timeField: 'sentAt',
      metaField: 'metadata',
      granularity: 'minutes'
    }
  })
};

class BatteryAggregator extends DataAggregator {
  private declare pipelineCommonDcField: any;
  private declare pipelineBaseDcField: any;

  constructor() {
    super();
    this.minuteModel = model('BatteryMinuteData', timeSchema.minuteSchema);
    this.hourlyModel = model('BatteryHourlyData', timeSchema.hourlySchema);
    this.dailyModel = model('BatteryDailyData', timeSchema.dailySchema);
    this.weeklyModel = model('BatteryWeeklyData', timeSchema.weeklySchema);
    this.model = batteryInstance.getModel();

    this.definePipeline();
  }

  definePipeline() {
    this.pipelineBaseField = {
      ...DataAggregator.pipelineCommonField,
      totalEnergy: 1,
      //humidity
      maxHumidity: 1,
      minHumidity: 1,
      avgHumidity: 1,
      //temperature
      maxTemperature: 1,
      minTemperature: 1,
      avgTemperature: 1
    };

    this.pipelineCalculateField = {
      ...DataAggregator.pipelineCommonCalculateField,
      totalEnergy: { $sum: { $multiply: ['$voltage', '$ampere'] } },
      //humidity
      maxHumidity: { $max: '$humidity' },
      minHumidity: { $min: '$humidity' },
      avgHumidity: { $avg: '$humidity' },
      //temperature
      maxTemperature: { $max: '$temperature' },
      minTemperature: { $min: '$temperature' },
      avgTemperature: { $avg: '$temperature' }
    };

    this.minutePipeline = [
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            hour: { $hour: '$createdAt' },
            minute: { $minute: '$createdAt' }, // Added minute grouping
            workspaceId: '$siteId', // Keep this as is
            deviceId: '$deviceId'
          },
          ...this.pipelineCalculateField
        }
      },
      {
        $project: {
          ...this.pipelineBaseField
        }
      }
    ];

    this.hourlyPipeline = [
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            hour: { $hour: '$createdAt' },
            siteId: '$siteId',
            deviceId: '$deviceId'
          },
          ...this.pipelineCalculateField
        }
      },
      {
        $project: {
          ...this.pipelineBaseField
        }
      }
    ];

    this.dailyPipeline = [
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            hour: { $hour: '$createdAt' },
            siteId: '$siteId',
            deviceId: '$deviceId'
          },
          ...this.pipelineCalculateField
        }
      },
      {
        $project: {
          ...this.pipelineBaseField
        }
      }
    ];

    this.weeklyPipeline = [
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            hour: { $hour: '$createdAt' },
            siteId: '$siteId',
            deviceId: '$deviceId'
          },
          ...this.pipelineCalculateField
        }
      },
      {
        $project: {
          ...this.pipelineBaseField
        }
      }
    ];
  }

  async getMinuteDataAggregate(deviceIds: (string | Types.ObjectId)[] = [], lastMinutes = 1) {
    const matchPipeline: any = {
      $match: {
        createdAt: { $gt: moment().subtract(lastMinutes, 'minutes').toDate() } // sentAt must be higher than one minute ago
      }
    };
    if (deviceIds.length) {
      matchPipeline.deviceId = { $in: deviceIds };
    }
    const pipeline = [matchPipeline, ...this.minutePipeline]; // Assuming minutePipeline is defined similarly to hourly/daily/weekly

    const results = await this.model.aggregate(pipeline).exec();

    return results;
  }

  async getHourlyDataAggregate(deviceIds: (string | Types.ObjectId)[] = [], lastHours = 1) {
    const matchPipeline: any = {
      $match: {
        createdAt: { $gt: moment().subtract(lastHours, 'hours').toDate() } // sentAt must be higher than one hour ago
      }
    };
    if (deviceIds.length) {
      matchPipeline.deviceId = { $in: deviceIds };
    }
    const pipeline = [matchPipeline, ...this.hourlyPipeline];

    const results = await this.model.aggregate(pipeline).exec();

    return results;
  }

  async getDailyDataAggregate(deviceIds: (string | Types.ObjectId)[] = [], lastDays = 1) {
    const matchPipeline: any = {
      $match: {
        createdAt: { $gt: moment().subtract(lastDays, 'days').toDate() } // sentAt must be higher than one hour ago
      }
    };
    if (deviceIds.length) {
      matchPipeline.deviceId = { $in: deviceIds };
    }
    const pipeline = [matchPipeline, ...this.dailyPipeline];

    const results = await this.model.aggregate(pipeline).exec();
    return results;
  }

  async getWeeklyDataAggregate(deviceIds: (string | Types.ObjectId)[] = [], lastWeeks = 1) {
    const matchPipeline: any = {
      $match: {
        createdAt: { $gt: moment().subtract(lastWeeks, 'weeks').toDate() } // sentAt must be higher than one hour ago
      }
    };
    if (deviceIds.length) {
      matchPipeline.deviceId = { $in: deviceIds };
    }
    const pipeline = [matchPipeline, ...this.weeklyPipeline];

    const results = await this.model.aggregate(pipeline).exec();
    return results;
  }
}

const batteryAggregate = new BatteryAggregator();

export type IBatteryDataAggregate = InferSchemaType<typeof timeSchema.minuteSchema>;

export default batteryAggregate;

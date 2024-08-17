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

  max_volt: Number,
  min_volt: Number,
  avg_volt: Number,
  total_volt: Number,

  min_power: Number,
  max_power: Number,
  avg_power: Number,
  total_power: Number,

  min_current: Number,
  max_current: Number,
  avg_current: Number,
  total_current: Number,

  min_humidity: Number,
  max_humidity: Number,
  avg_humidity: Number,

  min_temperature: Number,
  max_temperature: Number,
  avg_temperature: Number,
  total_temperature: Number,

  total_energy: Number,
  total_charged: Number,
  total_discharged: Number,

  data_points: Number,
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
      total_energy: 1,
      //humidity
      max_humidity: 1,
      min_humidity: 1,
      avg_humidity: 1,
      //temperature
      max_temperature: 1,
      min_temperature: 1,
      avg_temperature: 1
    };

    this.pipelineCalculateField = {
      ...DataAggregator.pipelineCommonCalculateField,
      total_energy: { $sum: { $multiply: ['$voltage', '$ampere'] } },
      //humidity
      max_humidity: { $max: '$humidity' },
      min_humidity: { $min: '$humidity' },
      avg_humidity: { $avg: '$humidity' },
      //temperature
      max_temperature: { $max: '$temperature' },
      min_temperature: { $min: '$temperature' },
      avg_temperature: { $avg: '$temperature' }
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

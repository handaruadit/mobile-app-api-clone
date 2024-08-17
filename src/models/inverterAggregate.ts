import { InferSchemaType, Schema, Types, model } from 'mongoose';
import moment from 'moment';
import DataAggregator from './DataAggregator';
import { inverterData } from '@/types';
import { createPipelineBaseField, createPipelineCalculateField } from '@/lib/createPipeline';

const indentifier = {
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

const field = {
  // With each prefix equals mongo operator
  //
  max_acVoltageIn: { type: Number, default: 0 },
  min_acVoltageIn: { type: Number, default: 0 },
  avg_acVoltageIn: { type: Number, default: 0 },
  total_acVoltageIn: { type: Number, default: 0 },
  max_acVoltageOut: { type: Number, default: 0 },
  min_acVoltageOut: { type: Number, default: 0 },
  avg_acVoltageOut: { type: Number, default: 0 },
  total_acVoltageOut: { type: Number, default: 0 },

  max_acPowerIn: { type: Number, default: 0 },
  min_acPowerIn: { type: Number, default: 0 },
  avg_acPowerIn: { type: Number, default: 0 },
  total_acPowerIn: { type: Number, default: 0 },
  max_acPowerOut: { type: Number, default: 0 },
  min_acPowerOut: { type: Number, default: 0 },
  avg_acPowerOut: { type: Number, default: 0 },
  total_acPowerOut: { type: Number, default: 0 },

  max_acCurrentIn: { type: Number, default: 0 },
  min_acCurrentIn: { type: Number, default: 0 },
  avg_acCurrentIn: { type: Number, default: 0 },
  total_acCurrentIn: { type: Number, default: 0 },
  max_acCurrentOut: { type: Number, default: 0 },
  min_acCurrentOut: { type: Number, default: 0 },
  avg_acCurrentOut: { type: Number, default: 0 },
  total_acCurrentOut: { type: Number, default: 0 }
};

const timeSchema = {
  minuteSchema: new Schema(
    { ...indentifier, ...field },
    {
      timestamps: true,
      timeseries: {
        timeField: 'sentAt',
        metaField: 'metadata',
        granularity: 'minutes'
      }
    }
  ),
  hourlySchema: new Schema(
    { ...indentifier, ...field },
    {
      timestamps: true,
      timeseries: {
        timeField: 'sentAt',
        metaField: 'metadata',
        granularity: 'hours'
      }
    }
  ),
  dailySchema: new Schema(
    { ...indentifier, ...field },
    {
      timestamps: true,
      timeseries: {
        timeField: 'sentAt',
        metaField: 'metadata',
        granularity: 'days'
      }
    }
  ),
  weeklySchema: new Schema(
    { ...indentifier, ...field },
    {
      timestamps: true,
      timeseries: {
        timeField: 'sentAt',
        metaField: 'metadata',
        granularity: 'weeks'
      }
    }
  )
};

class InverterAggregator extends DataAggregator {
  private declare pipelineCommonDcField: any;
  private declare pipelineBaseDcField: any;

  constructor() {
    super();
    this.minuteModel = model('InverterMinuteData', timeSchema.minuteSchema);
    this.hourlyModel = model('InverterHourlyData', timeSchema.hourlySchema);
    this.dailyModel = model('InverterDailyData', timeSchema.dailySchema);
    this.weeklyModel = model('InverterWeeklyData', timeSchema.weeklySchema);
    this.model = inverterData.getModel();

    this.definePipeline();
  }

  definePipeline() {
    const pipelineBase = createPipelineBaseField(field);
    const pipelineCalculate = createPipelineCalculateField(field);
    this.pipelineBaseField = {
      ...DataAggregator.pipelineCommonField,
      ...pipelineBase
    };

    this.pipelineCalculateField = {
      // ...DataAggregator.pipelineCommonCalculateField,
      ...pipelineCalculate,
      data_points: { $sum: 1 }
    };

    this.minutePipeline = [
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            hour: { $hour: '$createdAt' },
            minute: { $minute: '$createdAt' },
            workspaceId: '$siteId',
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
            workspaceId: '$siteId',
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
            workspaceId: '$siteId',
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
            week: { $isoWeek: '$createdAt' },
            workspaceId: '$siteId',
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
        createdAt: { $gt: moment().subtract(lastMinutes, 'minutes').toDate() }
      }
    };
    if (deviceIds.length) {
      matchPipeline.deviceId = { $in: deviceIds };
    }
    const pipeline = [matchPipeline, ...this.minutePipeline];

    const results = await this.model.aggregate(pipeline).exec();

    return results;
  }
  async getHourlyDataAggregate(deviceIds: (string | Types.ObjectId)[] = [], lastHours = 1) {
    const matchPipeline: any = {
      $match: {
        createdAt: { $gt: moment().subtract(lastHours, 'hours').toDate() }
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
        createdAt: { $gt: moment().subtract(lastDays, 'days').toDate() }
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
        createdAt: {
          $gt: moment()
            .subtract(lastWeeks * 7, 'days')
            .toDate()
        }
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

const inverterAggregate = new InverterAggregator();

export type IInverterDataAggregate = InferSchemaType<typeof timeSchema.minuteSchema>;

export default inverterAggregate;

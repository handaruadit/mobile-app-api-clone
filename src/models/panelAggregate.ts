import { InferSchemaType, Schema, Types, model } from 'mongoose';
import moment from 'moment';
import DataAggregator from './DataAggregator';
import { panelData } from '@/types';
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
  max_voltage: { type: Number, default: 0 },
  min_voltage: { type: Number, default: 0 },
  avg_voltage: { type: Number, default: 0 },
  total_voltage: { type: Number, default: 0 },

  max_power: { type: Number, default: 0 },
  min_power: { type: Number, default: 0 },
  avg_power: { type: Number, default: 0 },
  total_power: { type: Number, default: 0 },

  max_current: { type: Number, default: 0 },
  min_current: { type: Number, default: 0 },
  avg_current: { type: Number, default: 0 },
  total_current: { type: Number, default: 0 },

  max_lux: { type: Number, default: 0 },
  min_lux: { type: Number, default: 0 },
  avg_lux: { type: Number, default: 0 },
  total_lux: { type: Number, default: 0 },

  max_temperature: { type: Number, default: 0 },
  min_temperature: { type: Number, default: 0 },
  avg_temperature: { type: Number, default: 0 },
  total_temperature: { type: Number, default: 0 }
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

class panelAggregator extends DataAggregator {
  private declare pipelineCommonDcField: any;
  private declare pipelineBaseDcField: any;

  constructor() {
    super();
    this.minuteModel = model('panelMinuteData', timeSchema.minuteSchema);
    this.hourlyModel = model('panelHourlyData', timeSchema.hourlySchema);
    this.dailyModel = model('panelDailyData', timeSchema.dailySchema);
    this.weeklyModel = model('panelWeeklyData', timeSchema.weeklySchema);
    this.model = panelData.getModel();

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

const panelAggregate = new panelAggregator();

export type IPanelDataAggregate = InferSchemaType<typeof timeSchema.minuteSchema>;

export default panelAggregate;

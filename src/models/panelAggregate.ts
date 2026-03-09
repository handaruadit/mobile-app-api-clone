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

const field = {
  maxVoltage: { type: Number, default: 0 },
  minVoltage: { type: Number, default: 0 },
  avgVoltage: { type: Number, default: 0 },
  totalVoltage: { type: Number, default: 0 },

  maxPower: { type: Number, default: 0 },
  minPower: { type: Number, default: 0 },
  avgPower: { type: Number, default: 0 },
  totalPower: { type: Number, default: 0 },

  maxCurrent: { type: Number, default: 0 },
  minCurrent: { type: Number, default: 0 },
  avgCurrent: { type: Number, default: 0 },
  totalCurrent: { type: Number, default: 0 },

  maxLux: { type: Number, default: 0 },
  minLux: { type: Number, default: 0 },
  avgLux: { type: Number, default: 0 },
  totalLux: { type: Number, default: 0 },

  maxTemperature: { type: Number, default: 0 },
  minTemperature: { type: Number, default: 0 },
  avgTemperature: { type: Number, default: 0 },
  totalTemperature: { type: Number, default: 0 }
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
      dataPoints: { $sum: 1 }
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

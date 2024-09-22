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
  // With each prefix equals mongo operator
  //
  maxAcVoltageIn: { type: Number, default: 0 },
  minAcVoltageIn: { type: Number, default: 0 },
  avgAcVoltageIn: { type: Number, default: 0 },
  totalAcVoltageIn: { type: Number, default: 0 },
  maxAcVoltageOut: { type: Number, default: 0 },
  minAcVoltageOut: { type: Number, default: 0 },
  avgAcVoltageOut: { type: Number, default: 0 },
  totalAcVoltageOut: { type: Number, default: 0 },

  maxAcPowerIn: { type: Number, default: 0 },
  minAcPowerIn: { type: Number, default: 0 },
  avgAcPowerIn: { type: Number, default: 0 },
  totalAcPowerIn: { type: Number, default: 0 },
  maxAcPowerOut: { type: Number, default: 0 },
  minAcPowerOut: { type: Number, default: 0 },
  avgAcPowerOut: { type: Number, default: 0 },
  totalAcPowerOut: { type: Number, default: 0 },

  maxAcCurrentIn: { type: Number, default: 0 },
  minAcCurrentIn: { type: Number, default: 0 },
  avgAcCurrentIn: { type: Number, default: 0 },
  totalAcCurrentIn: { type: Number, default: 0 },
  maxAcCurrentOut: { type: Number, default: 0 },
  minAcCurrentOut: { type: Number, default: 0 },
  avgAcCurrentOut: { type: Number, default: 0 },
  totalAcCurrentOut: { type: Number, default: 0 }
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

const inverterAggregate = new InverterAggregator();

export type IInverterDataAggregate = InferSchemaType<typeof timeSchema.minuteSchema>;

export default inverterAggregate;

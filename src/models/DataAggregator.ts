import mongoose, { Model } from 'mongoose';

abstract class DataAggregator {
  declare minuteModel: Model<any>;
  declare minutePipeline: mongoose.PipelineStage[];
  declare hourlyModel: Model<any>;
  declare hourlyPipeline: mongoose.PipelineStage[];
  declare dailyModel: Model<any>;
  declare dailyPipeline: mongoose.PipelineStage[];
  declare weeklyModel: Model<any>;
  declare weeklyPipeline: mongoose.PipelineStage[];
  declare model: Model<any>;
  declare pipelineBaseField: any;
  declare pipelineCalculateField: any;
  static get pipelineCommonField() {
    return {
      siteId: '$_id.siteId',
      workspaceId: '$_id.workspaceId',
      deviceId: '$_id.deviceId',
      timestamp: {
        $dateFromString: {
          dateString: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' },
              '-',
              { $toString: '$_id.day' },
              'T',
              { $toString: '$_id.hour' },
              ':',
              { $toString: '$_id.minute' },
              ':00Z'
            ]
          }
        }
      },
      max_volt: 1,
      min_volt: 1,
      avg_volt: 1,
      total_volt: 1,
      //power
      max_power: 1,
      min_power: 1,
      avg_power: 1,
      total_power: 1,
      //current
      max_current: 1,
      min_current: 1,
      avg_current: 1,
      total_current: 1,

      data_points: 1
    };
  }
  static get pipelineCommonCalculateField() {
    return {
      //volt
      max_volt: { $max: '$voltage' },
      min_volt: { $min: '$voltage' },
      avg_volt: { $avg: '$voltage' },
      total_volt: { $sum: '$voltage' },
      //power
      max_power: { $max: '$power' },
      min_power: { $min: '$power' },
      avg_power: { $avg: '$power' },
      total_power: { $sum: '$power' },
      //current
      max_current: { $max: '$current' },
      min_current: { $min: '$current' },
      avg_current: { $avg: '$current' },
      total_current: { $sum: '$current' },
      data_points: { $sum: 1 }
    };
  }
}

export default DataAggregator;

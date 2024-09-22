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
      maxVolt: 1,
      minVolt: 1,
      avgVolt: 1,
      totalVolt: 1,
      //power
      maxPower: 1,
      minPower: 1,
      avgPower: 1,
      totalPower: 1,
      //current
      maxCurrent: 1,
      minCurrent: 1,
      avgCurrent: 1,
      totalCurrent: 1,

      dataPoints: 1
    };
  }
  static get pipelineCommonCalculateField() {
    return {
      //volt
      maxVolt: { $max: '$voltage' },
      minVolt: { $min: '$voltage' },
      avgVolt: { $avg: '$voltage' },
      totalVolt: { $sum: '$voltage' },
      //power
      maxPower: { $max: '$power' },
      minPower: { $min: '$power' },
      avgPower: { $avg: '$power' },
      totalPower: { $sum: '$power' },
      //current
      maxCurrent: { $max: '$current' },
      minCurrent: { $min: '$current' },
      avgCurrent: { $avg: '$current' },
      totalCurrent: { $sum: '$current' },
      dataPoints: { $sum: 1 }
    };
  }
}

export default DataAggregator;

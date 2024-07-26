import { model, Schema } from 'mongoose';
import moment from 'moment-timezone';
import type { InferSchemaType, Types, Model } from 'mongoose';

import Abstract from '@/models/abstract';

import { StringIds } from '@/interfaces/common';
import { OutputMainInverterData } from '@/types';

const schema = new Schema(
  {
    uuid: {
      type: String
    },
    siteId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Workspace'
    },
    deviceId:  {
      type: Schema.Types.ObjectId,
      required: true,
      // required: [true, ValidationErrorCodes.WORKSPACE_IS_REQUIRED],
      ref: 'Device',
    },
    metadata: { type: Object },
    acVoltageIn: {
      type: Number, // unit: volts
    },
    acCurrentIn:  {
      type: Number, // unit: amperes
    },
    acPowerIn:  {
      type: Number, // unit: watts
    },
    acVoltageOut: {
      type: Number, // unit: volts
    },
    acCurrentOut:  {
      type: Number, // unit: amperes
    },
    acPowerOut:  {
      type: Number, // unit: watts
    },

    timezone: {
      type: String,
      // required: [true, ValidationErrorCodes.TIMEZONE_REQUIRED]
    },
    isOnline: {
      type: Boolean
    },
    sentAt: {
      type: Date,
      required: true,
      default: new Date()
    },
  },
  {
    timestamps: true,
    timeseries: {
      timeField: 'sentAt',
      metaField: 'metadata',
      granularity: 'seconds',
    }
  }
);

export type IInverterDataModel = InferSchemaType<typeof schema>;
export type IInverterDataModelWithId = IInverterDataModel & {
  _id: Types.ObjectId;
};
export type IInverterDataModelOutput = StringIds<IInverterDataModelWithId>;
export type IInverterDataModelPayload = Omit<
  IInverterDataModel,
  'createdAt' | 'updatedAt'
>;

class MongooseModel extends Abstract {
  declare model: Model<IInverterDataModel>;
  interface: IInverterDataModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    this.model = model('InverterData', schema);
  };

  /**
   * 
   * @param deviceIds 
   * @param days days 0 means it's only today
   * @param timezone 
   * @returns 
   */
  getMainStats = async (
    deviceIds: string[] | Types.ObjectId[],
    uuids: string[] | Types.ObjectId[],
    days: number,
    timezone: string = 'Asia/Jakarta'
  ): Promise<OutputMainInverterData> => {
    const todayStart = moment().tz(timezone).subtract(days, 'days').startOf('day');

    // const deviceList = await device.find<IDeviceModelWithId>({
    //   _id: { $in: deviceIds }
    // });
    // const batteryIds = [];
    // const pvIds = [];
    // const inverterIds = [];

    const matchPipeline: any = {
      sentAt: { $gte: todayStart.toDate() },
      deviceId: { $in: deviceIds }
    }
    if (uuids.length) {
      matchPipeline.uuid = { $in: uuids };
    };
    const pipeline = [
      {
        $match: matchPipeline
      },
      {
        $group: {
          _id: null,
          totalPowerIn: { $sum: "$acPowerIn" },
          averagePowerIn: { $avg: "$acPowerIn" },
          totalPowerOut: { $sum: "$acPowerOut" },
          averagePowerOut: { $avg: "$acPowerOut" },
          totalConsumption: { $sum: "$acPowerOut" },
          averageConsumption: { $avg: "$acPowerOut" },
          totalAcVoltageIn: { $sum: "$acVoltageIn" },
          averageAcVoltageIn: { $avg: "$acVoltageIn" },
          totalAcVoltageOut: { $sum: "$acVoltageOut" },
          averageAcVoltageOut: { $avg: "$acVoltageOut" },
          totalAcCurrenctIn: { $sum: "$acCurrenctIn" },
          averageAcCurrenctIn: { $avg: "$acCurrenctIn" },
          totalAcCurrentOut: { $sum: "$acCurrentOut" },
          averageAcCurrentOut: { $avg: "$acCurrentOut" }
        }
      }
    ];

    const result = await this.model.aggregate(pipeline);
    return result ? result[0] : {};
  }

  // TODO
  getTimeseriesData = async (deviceIds: string[] | Types.ObjectId[], hours?: number, timezone: string = 'UTC') => {
    const filterDate = moment().tz(timezone).subtract(hours, 'hours').toDate();
    
    return await this.find<IInverterDataModelWithId>(
      {
        sentAt: { $gte: filterDate },
        deviceId: { $in: deviceIds }
      },
      'sentAt',
      undefined,
      undefined,
      undefined,
      undefined,
      'deviceId sentAt acCurrentIn acPowerIn acVoltageIn acCurrentOut acPowerOut acVoltageOut temperature heatIndex humidity createdAt'
    );
  }

  // populate = (query: Query<any, any>) =>
  //   query
  //     .populate('device', '_id name email');
}

const inst = new MongooseModel();
export default inst;
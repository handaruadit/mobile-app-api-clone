import { model, Schema } from 'mongoose';
import moment from 'moment-timezone';
import type { InferSchemaType, Types, Model } from 'mongoose';

import Abstract from '@/models/abstract';

import { StringIds } from '@/interfaces/common';

const schema = new Schema(
  {
    uuid: {
      type: String
    },
    siteId: {
      type: String, // should be type: Schema.Types.ObjectId in the future.
    },
    deviceId:  {
      type: Schema.Types.ObjectId,
      required: true,
      // required: [true, ValidationErrorCodes.WORKSPACE_IS_REQUIRED],
      ref: 'Device',
    },
    inverterId: {
      type: String
    },
    voltage: { type: Number }, // unit: volts
    current: { type: Number }, // unit: amperes
    power: { type: Number }, // unit: watts
    temperature: { type: Number }, // Celcius
    humidity: { type: Number }, // percentage
    heatIndex: { type: Number }, // just index
    metadata: { type: Object },
    // todo in future
    // device: {
    //   type: Schema.Types.ObjectId,
    //   required: [true, ValidationErrorCodes.COMPANY_REQUIRED],
    //   ref: 'Device',
    //   validate: {
    //     validator: (v: string) => isValidObjectId(v),
    //     message: ValidationErrorCodes.INVALID_COMPANY
    //   }
    // },
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

export type IBatteryDataModel = InferSchemaType<typeof schema>;
export type IBatteryDataModelWithId = IBatteryDataModel & {
  _id: Types.ObjectId;
};
export type IBatteryDataModelOutput = StringIds<IBatteryDataModelWithId>;
export type IBatteryDataModelPayload = Omit<
  IBatteryDataModel,
  'createdAt' | 'updatedAt'
>;

class MongooseModel extends Abstract {
  declare model: Model<IBatteryDataModel>;
  interface: IBatteryDataModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    this.model = model('BatteryData', schema);
  };

  /**
   * 
   * @param deviceIds 
   * @param days days 0 means it's only today
   * @param timezone 
   * @returns 
   */
  getMainStats = async (deviceIds: string[] | Types.ObjectId[],  days: number, timezone: string = 'UTC') => {
    const todayStart = moment().tz(timezone).subtract(days, 'days').startOf('day');
    
    const pipeline = [
      {
        $match: {
          sentAt: { $gte: todayStart.toDate() },
          deviceId: { $in: deviceIds }
        }
      },
      {
        $group: {
          _id: null,
          totalYield: { $sum: { $add: ["$panelPower", "$batteryPower"] } },
          totalConsumption: { $sum: { $add: ["$panelPower", "$batteryPower" ] } },
          totalCharging: { $sum: "$batteryPower" },
          totalPowerUsage: { $sum: "$panelPower" }
        }
      }
    ];

    return await this.model.aggregate(pipeline);
  }

  // TODO
  getTimeseriesData = async (deviceIds: string[] | Types.ObjectId[], hours?: number, timezone: string = 'UTC') => {
    const filterDate = moment().tz(timezone).subtract(hours, 'hours').toDate();
    
    return await this.find<IBatteryDataModelWithId>(
      {
        sentAt: { $gte: filterDate },
        deviceId: { $in: deviceIds }
      },
      'sentAt',
      undefined,
      undefined,
      undefined,
      undefined,
      'deviceId sentAt current power voltage power temperature heatIndex humidity createdAt'
    );
  }

  // populate = (query: Query<any, any>) =>
  //   query
  //     .populate('device', '_id name email');
}

const inst = new MongooseModel();
export default inst;
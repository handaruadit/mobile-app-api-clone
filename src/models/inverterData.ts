import { model, Schema } from 'mongoose';
import moment from 'moment-timezone';
import type { InferSchemaType, Types, Model } from 'mongoose';

import Abstract from '@/models/abstract';

import { StringIds } from '@/interfaces/common';

const schema = new Schema(
  {
    siteId: {
      type: String, // should be type: Schema.Types.ObjectId in the future.
    },
    deviceId:  {
      type: Schema.Types.ObjectId,
      required: true,
      // required: [true, ValidationErrorCodes.WORKSPACE_IS_REQUIRED],
      ref: 'Device',
    },
    metadata: Object,
    panelVoltage: {
      type: Number, // unit: volts
    },
    batteryVoltage:  {
      type: Number, // unit: volts
    },
    panelCurrent:  {
      type: Number, // unit: amperes
    },
    batteryCurrent:  {
      type: Number, // unit: amperes
    },
    panelPower:  {
      type: Number, // unit: watts
    },
    batteryPower:  {
      type: Number, // unit: watts
    },
    timezone: {
      type: String,
      // required: [true, ValidationErrorCodes.TIMEZONE_REQUIRED]
    },
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
    receivedAt: {
      type: Date
    },
    sentAt: {
      type: Date
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
          todayConsumption: { $sum: { $add: ["$panelPower", "$batteryPower" ] } },
          totalCharging: { $sum: "$batteryPower" },
          totalPowerUsage: { $sum: "$panelPower" }
        }
      }
    ];

    return await this.model.aggregate(pipeline);
  }

  // TODO
  getTimeseriesData = async (deviceIds: string[] | Types.ObjectId[],  days: number, timezone: string = 'UTC') => {

  }

  // populate = (query: Query<any, any>) =>
  //   query
  //     .populate('device', '_id name email');
}

const inst = new MongooseModel();
export default inst;
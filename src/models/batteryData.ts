import { model, Schema } from 'mongoose';
import moment from 'moment-timezone';
import type { InferSchemaType, Types, Model } from 'mongoose';

import Abstract from '@/models/abstract';

import { StringIds } from '@/interfaces/common';
import { OutputMainBatteryData } from '@/types';

const schema = new Schema(
  {
    uuid: {
      type: String // todo: change this to proper UUID or ObjectID
    },
    topic: {
      type: String
    },
    siteId: {
      type: Schema.Types.ObjectId,
      // required: true,
      ref: 'Workspace'
    },
    // we may miss information about which battery is this!
    // batteryId != deviceId
    // assume that batteryId is sent from site, and it's unique to all batteries
    deviceId: {
      type: Schema.Types.ObjectId,
      // required: true,
      // required: [true, ValidationErrorCodes.WORKSPACE_IS_REQUIRED],
      ref: 'Device'
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
    metrics: { type: Object },
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
      // required: true,
      default: new Date()
    }
  },
  {
    timestamps: true,
    timeseries: {
      timeField: 'sentAt',
      metaField: 'metadata',
      granularity: 'seconds'
    }
  }
);

// Add specified indexes
schema.index({ siteId: 1 });
schema.index({ uuid: 1 });
schema.index({ topic: 1 });
schema.index({ sentAt: -1 });

export type IBatteryDataModel = InferSchemaType<typeof schema>;
export type IBatteryDataModelWithId = IBatteryDataModel & {
  _id: Types.ObjectId;
};
export type IBatteryDataModelOutput = StringIds<IBatteryDataModelWithId>;
export type IBatteryDataModelPayload = Omit<IBatteryDataModel, 'createdAt' | 'updatedAt'>;

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
   * TODO: MAKE THIS A CLASS BASED SO THAT WE DON'T NEED TO REPEAT FOR OTHER MODEL
   * @param deviceIds
   * @param days days 0 means it's only today
   * @param timezone
   * @returns
   */
  getMainStats = async (
    deviceIds: string[] | Types.ObjectId[],
    uuids: string[] | Types.ObjectId[],
    days: number,
    timezone = 'Asia/Jakarta'
  ): Promise<OutputMainBatteryData> => {
    const todayStart = moment().tz(timezone).subtract(days, 'days').startOf('day');

    const matchPipeline: any = {
      sentAt: { $gte: todayStart.toDate() },
      deviceId: { $in: deviceIds }
    };
    if (uuids.length) {
      matchPipeline.uuid = { $in: uuids };
    }

    const pipeline = [
      {
        $match: matchPipeline
      },
      {
        $group: {
          _id: null,
          totalYield: { $sum: { $add: ['$power'] } },
          totalConsumption: {
            $sum: {
              $cond: {
                if: { $lt: ['$power', 0] },
                then: '$power',
                else: 0
              }
            }
          },
          totalCharging: {
            $sum: {
              $cond: {
                if: { $gt: ['$power', 0] },
                then: '$power',
                else: 0
              }
            }
          }
        }
      }
    ];

    const result = await this.model.aggregate(pipeline);
    return result ? result[0] : {};
  };

  // TODO
  getTimeseriesData = async (deviceIds: string[] | Types.ObjectId[], hours?: number, timezone = 'UTC') => {
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
  };

  // populate = (query: Query<any, any>) =>
  //   query
  //     .populate('device', '_id name email');
}

const inst = new MongooseModel();
export default inst;

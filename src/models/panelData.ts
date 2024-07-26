import { model, Schema } from 'mongoose';
import moment from 'moment-timezone';
import type { InferSchemaType, Types, Model } from 'mongoose';

import Abstract from '@/models/abstract';

import { StringIds } from '@/interfaces/common';
import { OutputMainPanelData } from '@/types';

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
    inverterId: {
      type: String
    },
    metadata: { type: Object },

    // PV panel
    voltage: {
      type: Number, // unit: volts
    },
    current:  {
      type: Number, // unit: amperes
    },
    power:  {
      type: Number, // unit: watts
    },
    lux: {
      type: Number, // lux
    },
    temperature: {
      type: Number // Celcius
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

export type IPanelDataModel = InferSchemaType<typeof schema>;
export type IPanelDataModelWithId = IPanelDataModel & {
  _id: Types.ObjectId;
};
export type IPanelDataModelOutput = StringIds<IPanelDataModelWithId>;
export type IPanelDataModelPayload = Omit<
  IPanelDataModel,
  'createdAt' | 'updatedAt'
>;

class MongooseModel extends Abstract {
  declare model: Model<IPanelDataModel>;
  interface: IPanelDataModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    this.model = model('PanelData', schema);
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
  ): Promise<OutputMainPanelData> => {
    const todayStart = moment().tz(timezone).subtract(days, 'days').startOf('day');
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
          totalYield: { $sum: { $add: ["$panelPower", "$batteryPower"] } },
          totalConsumption: { $sum: { $add: ["$panelPower", "$batteryPower" ] } },
          totalCharging: { $sum: "$batteryPower" },
          totalPowerUsage: { $sum: "$panelPower" }
        }
      }
    ];

    const result = await this.model.aggregate(pipeline);
    return result ? result[0] : {};
  }

  // TODO
  getTimeseriesData = async (deviceIds: string[] | Types.ObjectId[], hours?: number, timezone: string = 'UTC') => {
    const filterDate = moment().tz(timezone).subtract(hours, 'hours').toDate();
    
    return await this.find<IPanelDataModelWithId>(
      {
        sentAt: { $gte: filterDate },
        deviceId: { $in: deviceIds }
      },
      'sentAt',
      undefined,
      undefined,
      undefined,
      undefined,
      'deviceId sentAt current power voltage power lux createdAt'
    );
  }

  // populate = (query: Query<any, any>) =>
  //   query
  //     .populate('device', '_id name email');
}

const inst = new MongooseModel();
export default inst;
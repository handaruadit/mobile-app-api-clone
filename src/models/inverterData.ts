import { model, Schema, isValidObjectId } from 'mongoose';
import type { InferSchemaType, Types, Model, Query } from 'mongoose';

import Abstract from '@/models/abstract';

import { StringIds } from '@/interfaces/common';
import { ValidationErrorCodes } from '@/lib/enum';

const schema = new Schema(
  {
    siteId: {
      type: String, // should be type: Schema.Types.ObjectId in the future.
    },
    inverterId:  {
      type: String, // should be type: Schema.Types.ObjectId in the future.
    },
    metadata: Object,
    panelVoltage: {
      type: Number,
    },
    batteryVoltage:  {
      type: Number,
    },
    panelCurrent:  {
      type: Number,
    },
    batteryCurrent:  {
      type: Number,
    },
    panelPower:  {
      type: Number,
    },
    batteryPower:  {
      type: Number,
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
      granularity: 'minutes',
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

  // populate = (query: Query<any, any>) =>
  //   query
  //     .populate('device', '_id name email');
}

const inst = new MongooseModel();
export default inst;
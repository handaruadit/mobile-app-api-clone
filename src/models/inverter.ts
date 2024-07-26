import { model, Schema } from 'mongoose';
import type { InferSchemaType, Types, Model } from 'mongoose';

import Abstract from '@/models/abstract';

import { StringIds } from '@/interfaces/common';
import { ValidationErrorCodes } from '@/lib/enum';

// basically an inverter that send data
const schema = new Schema(
  {
    name: {
      type: String,
      required: [true, ValidationErrorCodes.NAME_REQUIRED],
      minlength: [2, ValidationErrorCodes.NAME_TOO_SHORT]
    },
    description: { type: String },
    brand: { type: String },
    uuid: { type: String }, // id that is open publicly 
    maxPowerOutput: {
      // in Watts
      type: Number,
    },
    maxDcVoltage: {
      // in Watts
      type: Number,
    },
    efficiency: {
      // %
      type: Number
    },
    operatingTemperatureRange: {
      min: { type: Number },
      max: { type: Number },
    },
    width: {
      // in m^2
      type: Number,
    },
    height: {
      type: Number
    },
    length: {
      type: Number,
    },
    weight: {
      // in Kg
      type: Number,
    },
    warrantyInMonths: { type: Number },
    // IngressProtection/IP Rating
    weatherResistanceRating: { type: String }
  },
  { timestamps: true }
);

export type IInverterModel = InferSchemaType<typeof schema>;
export type IInverterModelWithId = IInverterModel & {
  _id: Types.ObjectId;
};
export type IInverterModelPopulated = IInverterModelWithId;
export type IInverterModelOutput = StringIds<IInverterModelWithId>;
export type IInverterModelPayload = Omit<
  IInverterModel,
  'createdAt' | 'updatedAt'
>;

class MongooseModel extends Abstract {
  declare model: Model<IInverterModel>;
  interface: IInverterModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    this.model = model('Inverter', schema);
  };
}

const inst = new MongooseModel();
export default inst;

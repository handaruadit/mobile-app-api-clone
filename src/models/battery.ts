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
    capacity: {
      // in MWh
      type: Number,
    },
    voltage: {
       // in MWh
       type: Number,
    },
    internalResistance:{
      // in Ohms
      type: Number,
    },
    selfDischargeRate:{
      // Rate at which a battery loses its charge when not in use.
      type: Number,
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
    material: {
      // type of battery (e.g., lithium-ion, lead-acid, nickel-metal hydride)
      type: String,
    },
    warrantyInMonths: { type: Number },
    // IngressProtection/IP Rating
    weatherResistanceRating: { type: String }
  },
  { timestamps: true }
);

export type IBatteryModel = InferSchemaType<typeof schema>;
export type IBatteryModelWithId = IBatteryModel & {
  _id: Types.ObjectId;
};
export type IBatteryModelPopulated = IBatteryModelWithId;
export type IBatteryModelOutput = StringIds<IBatteryModelWithId>;
export type IBatteryModelPayload = Omit<
  IBatteryModel,
  'createdAt' | 'updatedAt'
>;

class MongooseModel extends Abstract {
  declare model: Model<IBatteryModel>;
  interface: IBatteryModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    this.model = model('Battery', schema);
  };
}

const inst = new MongooseModel();
export default inst;

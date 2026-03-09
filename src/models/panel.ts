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
    wattage: {
      // in Watts
      type: Number
    },
    efficiency: {
      // %
      type: Number
    },
    capacity: {
      // in MWh
      type: Number
    },
    voltage: {
      // in MWh
      type: Number
    },
    internalResistance: {
      // in Ohms
      type: Number
    },
    temperatureCoefficient: {
      // how the panel's performance is affected by temperature changes.
      type: Number
    },
    operatingTemperatureRange: {
      min: { type: Number },
      max: { type: Number }
    },
    width: {
      // in m^2
      type: Number
    },
    height: {
      type: Number
    },
    length: {
      type: Number
    },
    weight: {
      // in Kg
      type: Number
    },
    material: {
      // type of battery (e.g., lithium-ion, lead-acid, nickel-metal hydride)
      type: String
    },
    warrantyInMonths: { type: Number },
    // IngressProtection/IP Rating
    weatherResistanceRating: { type: String }
  },
  { timestamps: true }
);

export type IPanelModel = InferSchemaType<typeof schema>;
export type IPanelModelWithId = IPanelModel & {
  _id: Types.ObjectId;
};
export type IPanelModelPopulated = IPanelModelWithId;
export type IPanelModelOutput = StringIds<IPanelModelWithId>;
export type IPanelModelPayload = Omit<IPanelModel, 'createdAt' | 'updatedAt'>;

class MongooseModel extends Abstract {
  declare model: Model<IPanelModel>;
  interface: IPanelModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    this.model = model('Panel', schema);
  };
}

const inst = new MongooseModel();
export default inst;

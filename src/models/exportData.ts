import { model, Schema } from 'mongoose';
import type { InferSchemaType, Types, Model } from 'mongoose';

import Abstract from '@/models/abstract';

import { StringIds } from '@/interfaces/common';

// basically an inverter that send data
const schema = new Schema(
  {
    value: {
      type: String
    },
    type: { type: String }
  },
  { timestamps: true }
);

export type IExportDataModel = InferSchemaType<typeof schema>;
export type IExportDataModelWithId = IExportDataModel & {
  _id: Types.ObjectId;
};
export type IExportDataModelPopulated = IExportDataModelWithId;
export type IExportDataModelOutput = StringIds<IExportDataModelWithId>;
export type IExportDataModelPayload = Omit<IExportDataModel, 'createdAt' | 'updatedAt'>;

class MongooseModel extends Abstract {
  declare model: Model<IExportDataModel>;
  interface: IExportDataModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    this.model = model('IExportData', schema);
  };
}

const inst = new MongooseModel();
export default inst;

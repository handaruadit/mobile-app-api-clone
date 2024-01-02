import { model, Schema, isValidObjectId } from 'mongoose';
import type { InferSchemaType, Types, Model, Query } from 'mongoose';

import Abstract from '@/models/abstract';

import { StringIds } from '@/interfaces/common';
import { ValidationErrorCodes } from '@/lib/enum';

const schema = new Schema(
  {
    name: {
      type: String,
      required: [true, ValidationErrorCodes.NAME_REQUIRED],
      minlength: [2, ValidationErrorCodes.NAME_TOO_SHORT]
    },
    description: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      required: [true, ValidationErrorCodes.DEFAULT_REQUIRED]
    },
    language: {
      type: String,
      required: [true, ValidationErrorCodes.LANGUAGE_REQUIRED]
    },
    timezone: {
      type: String,
      required: [true, ValidationErrorCodes.TIMEZONE_REQUIRED]
    },
    company: {
      type: Schema.Types.ObjectId,
      required: [true, ValidationErrorCodes.COMPANY_REQUIRED],
      ref: 'Company',
      validate: {
        validator: (v: string) => isValidObjectId(v),
        message: ValidationErrorCodes.INVALID_COMPANY
      }
    },
    workspace: {
      type: Schema.Types.ObjectId,
      required: [true, ValidationErrorCodes.WORKSPACE_IS_REQUIRED],
      ref: 'Workspace',
      validate: {
        validator: (v: string) => isValidObjectId(v),
        message: ValidationErrorCodes.INVALID_COMPANY
      }
    },
    capacity: {
      // in MWh
      type: Number,
    },
    battery: {
      // in MWh
      type: Number,
    },
  },
  { timestamps: true }
);

export type IDeviceModel = InferSchemaType<typeof schema>;
export type IDeviceModelWithId = IDeviceModel & {
  _id: Types.ObjectId;
};
export type IDeviceModelOutput = StringIds<IDeviceModelWithId>;
export type IDeviceModelPayload = Omit<
  IDeviceModel,
  'createdAt' | 'updatedAt'
>;

class MongooseModel extends Abstract {
  declare model: Model<IDeviceModel>;
  interface: IDeviceModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    this.model = model('Device', schema);
  };

  populate = (query: Query<any, any>) =>
    query
      .populate('workspaceId', '_id name email')
      .populate('companyId', '_id name email');
}

const inst = new MongooseModel();
export default inst;

import { model, Schema, isValidObjectId } from 'mongoose';
import type { InferSchemaType, Types, Model } from 'mongoose';

import { StringIds } from '@/interfaces/common';
import { Industries, ValidationErrorCodes } from '@/lib/enum';

import Abstract from './abstract';

const schema = new Schema(
  {
    name: {
      type: String,
      required: [true, ValidationErrorCodes.NAME_IS_REQUIRED],
      minLength: [2, ValidationErrorCodes.NAME_TOO_SHORT]
    },
    country: {
      type: String,
      required: [true, ValidationErrorCodes.COUNTRY_IS_REQUIRED],
      minLength: [2, ValidationErrorCodes.COUNTRY_TOO_SHORT]
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: [true, ValidationErrorCodes.OWNER_ID_IS_REQUIRED],
      ref: 'User',
      validate: {
        validator: (value: string) => isValidObjectId(value),
        message: ValidationErrorCodes.INVALID_USER_ID
      }
    },
    industry: {
      type: String,
      enum: {
        values: Object.values(Industries),
        message: ValidationErrorCodes.INVALID_INDUSTRY
      }
    }
  },
  { timestamps: true }
);

export type ICompanyModel = InferSchemaType<typeof schema>;
export type ICompanyModelWithId = ICompanyModel & {
  _id: Types.ObjectId;
};
export type ICompanyModelOutput = StringIds<ICompanyModelWithId>;
export type ICompanyModelPayload = Omit<ICompanyModel, 'createdAt' | 'updatedAt'>;

class MongooseModel extends Abstract {
  declare model: Model<ICompanyModel>;
  interface: ICompanyModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    this.model = model('Company', schema);
  };
}

const inst = new MongooseModel();
export default inst;

import { model, Schema, isValidObjectId } from 'mongoose';
import type { InferSchemaType, Types, Model } from 'mongoose';

import { StringIds } from '@/interfaces/common';
import { ValidationErrorCodes } from '@/lib/enum';

import Abstract from './abstract';

const schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, ValidationErrorCodes.USER_ID_IS_REQUIRED],
      ref: 'User',
      validate: {
        validator: (value: string) => isValidObjectId(value),
        message: ValidationErrorCodes.INVALID_USER_ID
      }
    },
    token: {
      type: String,
      unique: true,
      required: [true, ValidationErrorCodes.TOKEN_IS_REQUIRED]
    },
    expireAt: {
      type: Date,
      default: Date.now,
      list: { expires: 1800 }
    }
  },
  { timestamps: true }
);

export type ITokenModel = InferSchemaType<typeof schema>;
export type ITokenModelWithId = ITokenModel & {
  _id: Types.ObjectId;
};
export type ITokenModelOutput = StringIds<ITokenModelWithId>;

class MongooseModel extends Abstract {
  declare model: Model<ITokenModel>;
  interface: ITokenModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    this.model = model('TokenPassword', schema);
  };
}

const inst = new MongooseModel();
export default inst;

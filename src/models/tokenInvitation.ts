import { Schema, model, isValidObjectId } from 'mongoose';
import type { InferSchemaType, Types, Model } from 'mongoose';
import isEmail from 'validator/lib/isEmail';

import { StringIds } from '@/interfaces/common';
import { Entities, Roles, ValidationErrorCodes } from '@/lib/enum';

import Abstract from './abstract';

const schema = new Schema(
  {
    userEmail: {
      type: String,
      required: [true, ValidationErrorCodes.EMAIL_IS_REQUIRED],
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => isEmail(v),
        message: ValidationErrorCodes.INVALID_EMAIL_ADDRESS
      }
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      required: [true, ValidationErrorCodes.WORKSPACE_IS_REQUIRED],
      ref: 'Workspace',
      validate: {
        validator: (value: string) => isValidObjectId(value),
        message: ValidationErrorCodes.INVALID_WORKSPACE_ID
      }
    },
    permissions: [
      {
        entity: {
          type: String,
          enum: {
            values: Object.values(Entities),
            message: ValidationErrorCodes.INVALID_ENTITY
          }
        },
        role: {
          type: String,
          enum: {
            values: Object.values(Roles),
            message: ValidationErrorCodes.INVALID_ROLE
          }
        }
      }
    ],
    token: {
      type: String,
      unique: true,
      required: [true, ValidationErrorCodes.TOKEN_IS_REQUIRED]
    },
    expireAt: {
      type: Date,
      default: Date.now,
      list: { expires: 604800 } // one week
    }
  },
  { timestamps: true }
);

export type ITokenInvitationModel = InferSchemaType<typeof schema>;
export type ITokenInvitationModelWithId = ITokenInvitationModel & {
  _id: Types.ObjectId;
};
export type ITokenInvitationModelOutput = StringIds<ITokenInvitationModelWithId>;

class MongooseModel extends Abstract {
  declare model: Model<ITokenInvitationModel>;
  interface: ITokenInvitationModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    this.model = model('TokenInvitation', schema);
  };
}

const inst = new MongooseModel();
export default inst;

import { model, Schema, InferSchemaType } from 'mongoose';
import type { Types, Model } from 'mongoose';
import isEmail from 'validator/lib/isEmail';

import { StringIds } from '@/interfaces/common';
import { DeviceDarkModeSettings, ValidationErrorCodes } from '@/lib/enum';

import Abstract from './abstract';

const schema = new Schema(
  {
    name: { type: String, minlength: [2, ValidationErrorCodes.NAME_TOO_SHORT] },
    email: {
      type: String,
      unique: true,
      required: [true, ValidationErrorCodes.EMAIL_IS_REQUIRED],
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => isEmail(v),
        message: ValidationErrorCodes.INVALID_EMAIL_ADDRESS
      }
    },
    password: {
      type: String,
      required: [true, ValidationErrorCodes.PASSWORD_REQUIRED],
      minlength: [6, ValidationErrorCodes.PASSWORD_TOO_SHORT]
    },
    job: { type: String, minLength: [2, ValidationErrorCodes.JOB_TOO_SHORT] },
    phoneNumber: {
      type: String,
      required: false,
      validate: {
        validator: (v: string) => /^\d{10,15}$/.test(v),
        message: ValidationErrorCodes.INVALID_PHONE_NUMBER
      }
    },
    hasWhatsapp: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    setting: {
      geolocation: { type: Boolean, default: false },
      notifications: { type: Boolean, default: false },
      darkMode: {
        type: String,
        default: DeviceDarkModeSettings.AUTO,
        enum: Object.values(DeviceDarkModeSettings)
      },
      time24: { type: Boolean, default: false },
      language: {
        type: String,
        default: 'id'
      }
    },
  },
  { timestamps: true }
);

export type IUserModel = InferSchemaType<typeof schema>;
export type IUserModelWithId = IUserModel & {
  _id: Types.ObjectId;
};
export type IUserModelOutput = StringIds<IUserModelWithId>;
export type IUserModelPayload = Omit<IUserModelOutput, 'createdAt' | 'updatedAt'>;

class MongooseModel extends Abstract {
  declare model: Model<IUserModel>;
  interface: IUserModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    this.model = model('User', schema);
  };
}

const inst = new MongooseModel();
export default inst;

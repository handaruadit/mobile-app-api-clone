
/**
 * mobileDevice is user's device.
 * a user can have multiple device.
 * a workspace must have an admin.
 */
import { model, Schema, isValidObjectId } from 'mongoose';
import type { InferSchemaType, Types, Model, Query } from 'mongoose';

import Abstract from '@/models/abstract';
import { IUserMinimalModel } from '@/types';
import { StringIds } from '@/interfaces/common';
import { DeviceDarkModeSettings, ValidationErrorCodes } from '@/lib/enum';

const schema = new Schema(
  {
    name: {
      type: String,
      required: [true, ValidationErrorCodes.LANGUAGE_REQUIRED],
      minlength: [2, ValidationErrorCodes.NAME_TOO_SHORT]
    },
    uuid: {
      type: String
    },
    platform: {
      type: String
    },
    versionName: {
      type: String
    },
    systemName: {
      type: String
    },
    buildNumber: {
      type: String
    },
    ip: { type: String },
    fcmToken: { type: String },
    location: {
      ip: String,
      country: String,
      city: String,
      state: String,
      coordinates: {
        longitude: Number,
        latitude: Number
      },
      timezone: String
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, ValidationErrorCodes.OWNER_REQUIRED],
      ref: 'User',
      validate: {
        validator: (v: string) => isValidObjectId(v),
        message: ValidationErrorCodes.INVALID_OWNER
      }
    },
    setting: {
      geolocation: Boolean,
      notifications: Boolean,
      darkMode: {
        type: String,
        enum: Object.values(DeviceDarkModeSettings)
      },
      time24: Boolean,
      language: {
        type: String,
        enum: String
      }
    }
  },
  { timestamps: true }
);

export type IUsersDeviceModel = InferSchemaType<typeof schema>;
export type IUsersDeviceModelWithId = IUsersDeviceModel & {
  _id: Types.ObjectId;
  _user: IUserMinimalModel;
};
export type IUsersDeviceModelOutput = StringIds<IUsersDeviceModelWithId>;
export type IUsersDeviceModelPayload = Omit<
  IUsersDeviceModel,
  'createdAt' | 'updatedAt'
>;

class MongooseModel extends Abstract {
  declare model: Model<IUsersDeviceModel>;
  interface: IUsersDeviceModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    schema.virtual('_user', {
      ref: 'User',
      localField: 'userId',
      foreignField: '_id',
      justOne: true
    });

    this.model = model('UsersDevice', schema);
  };

  populate = (query: Query<any, any>) =>
    query
      .populate('_user', '_id name email')
}

const inst = new MongooseModel();
export default inst;

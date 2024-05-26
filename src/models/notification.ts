import mongoose, { model, Schema } from 'mongoose';
import type { InferSchemaType, Types } from 'mongoose';

import { StringIds } from '@/types';

import Abstract from './abstract';

const MODEL_NAME = 'Notification';

const schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String
    },
    message: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'danger'],
      required: true,
      default: 'info'
    }
  },
  { timestamps: true }
);

export type INotificationModel = InferSchemaType<typeof schema>;

export type INotificationModelWithId = InferSchemaType<typeof schema> & {
  _id: mongoose.Types.ObjectId;
};
export type INotificationModelOutput = StringIds<INotificationModelWithId>;

export type INotificationModelPayload = StringIds<
  Omit<INotificationModel, 'createdAt' | 'updatedAt'>
>;

class Model extends Abstract {
  declare model: mongoose.Model<INotificationModel>;
  interface: INotificationModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    this.model = model(MODEL_NAME, schema);
  };

  isUserHasPermission = async (notificationId: string, userId: Types.ObjectId | string) => {
    const notif = await this.get<INotificationModelWithId>(notificationId, true);
    return notif && notif._id.equals(userId)
  }
}

const inst = new Model();
export default inst;

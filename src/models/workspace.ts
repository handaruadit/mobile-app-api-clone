import { model, Schema, isValidObjectId } from 'mongoose';
import type { InferSchemaType, Types, Model, Query } from 'mongoose';

import Abstract from '@/models/abstract';
import { IUserModelWithId } from '@/models/user';

import { StringIds } from '@/interfaces/common';
import { Entities, Roles, ValidationErrorCodes } from '@/lib/enum';

const schema = new Schema(
  {
    name: {
      type: String,
      required: [true, ValidationErrorCodes.LANGUAGE_REQUIRED],
      minlength: [2, ValidationErrorCodes.NAME_TOO_SHORT]
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
    ownerId: {
      type: Schema.Types.ObjectId,
      required: [true, ValidationErrorCodes.OWNER_REQUIRED],
      ref: 'User',
      validate: {
        validator: (v: string) => isValidObjectId(v),
        message: ValidationErrorCodes.INVALID_OWNER
      }
    },
    companyId: {
      type: Schema.Types.ObjectId,
      required: [true, ValidationErrorCodes.COMPANY_REQUIRED],
      ref: 'Company',
      validate: {
        validator: (v: string) => isValidObjectId(v),
        message: ValidationErrorCodes.INVALID_COMPANY
      }
    },
    members: [
      {
        id: {
          type: Schema.Types.ObjectId,
          required: [true, ValidationErrorCodes.MEMBER_ID_REQUIRED],
          ref: 'User',
          validate: {
            validator: (v: string) => isValidObjectId(v),
            message: ValidationErrorCodes.INVALID_MEMBER_ID
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
        ]
      }
    ]
  },
  { timestamps: true }
);

export type IWorkspaceModel = InferSchemaType<typeof schema>;
export type IWorkspaceModelWithId = IWorkspaceModel & {
  _id: Types.ObjectId;
  _owner: Pick<IUserModelWithId, '_id' | 'name' | 'email'>;
  _members: (Pick<IUserModelWithId, '_id' | 'name' | 'email'> & {
    permissions?: Record<string, string>[];
  })[];
};
export type IWorkspaceModelOutput = StringIds<IWorkspaceModelWithId>;
export type IWorkspaceModelPayload = Omit<
  IWorkspaceModel,
  'createdAt' | 'updatedAt' | 'members' | 'ownerId'
> & {
  members?: IWorkspaceModel['members'];
  ownerId?: IWorkspaceModel['ownerId'];
};

class MongooseModel extends Abstract {
  declare model: Model<IWorkspaceModel>;
  interface: IWorkspaceModel;

  constructor() {
    super();
    this.defineModel();
  }

  defineModel = () => {
    schema.virtual('_owner', {
      ref: 'User',
      localField: 'ownerId',
      foreignField: '_id',
      justOne: true
    });
    schema.virtual('_members', {
      ref: 'User',
      localField: 'members.id',
      foreignField: '_id'
    });

    this.model = model('Workspace', schema);
  };

  populate = (query: Query<any, any>) =>
    query
      .populate('_owner', '_id name email')
      .populate('_members', '_id name email');
}

const inst = new MongooseModel();
export default inst;
